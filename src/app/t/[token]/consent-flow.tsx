"use client";

import { useEffect, useRef, useState } from "react";

type Step = "intro" | "location" | "camera" | "done";
type PermState = "idle" | "requesting" | "granted" | "denied" | "unavailable" | "error";

async function postJson(url: string, body: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, data };
}

export function TrackingConsentFlow({
  token,
  label,
  purpose,
  requiresLocation,
  requiresCamera,
}: {
  token: string;
  label: string;
  purpose: string;
  requiresLocation: boolean;
  requiresCamera: boolean;
}) {
  const [step, setStep] = useState<Step>("intro");
  const [locationState, setLocationState] = useState<PermState>("idle");
  const [cameraState, setCameraState] = useState<PermState>("idle");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [captured, setCaptured] = useState(false);

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  useEffect(() => stopStream, []);

  function advanceAfterLocation() {
    if (requiresCamera) setStep("camera");
    else setStep("done");
  }

  async function beginFlow() {
    if (requiresLocation) setStep("location");
    else if (requiresCamera) setStep("camera");
    else setStep("done");
  }

  async function requestLocation() {
    setLocationState("requesting");
    if (!("geolocation" in navigator)) {
      setLocationState("unavailable");
      return;
    }
    const consentRes = await postJson("/api/consent", { token, type: "LOCATION" });
    if (!consentRes.ok) {
      setLocationState("error");
      return;
    }
    const consentId = consentRes.data.consentId as string;

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const r = await postJson("/api/location", {
          token,
          consentId,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracyMeters: pos.coords.accuracy,
          capturedAt: new Date(pos.timestamp).toISOString(),
        });
        setLocationState(r.ok ? "granted" : "error");
      },
      async (err) => {
        await postJson("/api/consent/deny", { consentId });
        setLocationState(err.code === err.TIMEOUT ? "unavailable" : "denied");
      },
      { enableHighAccuracy: true, timeout: 12_000, maximumAge: 0 },
    );
  }

  async function requestCamera() {
    setCameraState("requesting");
    if (!("mediaDevices" in navigator) || !navigator.mediaDevices.getUserMedia) {
      setCameraState("unavailable");
      return;
    }
    const consentRes = await postJson("/api/consent", { token, type: "CAMERA" });
    if (!consentRes.ok) {
      setCameraState("error");
      return;
    }
    const consentId = consentRes.data.consentId as string;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      const sessionRes = await postJson("/api/camera/session", { token, consentId });
      if (!sessionRes.ok) {
        setCameraState("error");
        stopStream();
        return;
      }
      const w = window as unknown as { __cameraSessionId?: string; __cameraConsentId?: string };
      w.__cameraSessionId = sessionRes.data.cameraSessionId;
      w.__cameraConsentId = consentId;
      setCameraState("granted");
    } catch {
      await postJson("/api/consent/deny", { consentId });
      setCameraState("denied");
    }
  }

  async function capturePhoto() {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    const base64 = dataUrl.split(",")[1] ?? "";

    const w = window as unknown as { __cameraSessionId?: string; __cameraConsentId?: string };
    const cameraSessionId = w.__cameraSessionId;
    const consentId = w.__cameraConsentId;
    if (!cameraSessionId || !consentId) return;

    const r = await postJson("/api/camera/capture", {
      token,
      cameraSessionId,
      consentId,
      mimeType: "image/jpeg",
      dataBase64: base64,
    });
    if (r.ok) {
      setCaptured(true);
      stopStream();
      setTimeout(() => setStep("done"), 800);
    }
  }

  return (
    <main className="grid-fade flex min-h-screen items-center justify-center bg-[color:var(--color-bg)] px-4 py-10">
      <div className="panel panel-glow w-full max-w-lg p-8">
        <p className="font-display text-xs uppercase tracking-widest text-accent">Helix Verify</p>
        <h1 className="mt-2 font-display text-xl text-[color:var(--color-text)]">{label}</h1>

        {step === "intro" && (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-[color:var(--color-text-dim)]">{purpose}</p>
            <div className="rounded-lg border border-[color:var(--color-panel-border)] bg-black/30 p-4 text-xs text-[color:var(--color-text-dim)]">
              <p className="mb-2 font-display text-[11px] uppercase tracking-wide text-accent">This link will request:</p>
              <ul className="list-inside list-disc space-y-1">
                {requiresLocation && <li>Your device&apos;s current GPS location, only if you approve your browser&apos;s permission prompt.</li>}
                {requiresCamera && <li>Access to your camera to capture a single still photo, only if you approve your browser&apos;s permission prompt.</li>}
                {!requiresLocation && !requiresCamera && <li>No sensitive permissions — this link only records a standard page visit.</li>}
              </ul>
              <p className="mt-2">You may deny any request. Denying will be recorded truthfully — no data is fabricated.</p>
            </div>
            <button
              onClick={beginFlow}
              className="w-full rounded-full bg-accent px-4 py-2.5 font-display text-xs font-semibold uppercase tracking-wide text-black hover:brightness-110"
            >
              Continue
            </button>
          </div>
        )}

        {step === "location" && (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-[color:var(--color-text-dim)]">
              Your browser will ask for permission to share your location.
            </p>
            {locationState === "idle" && (
              <button onClick={requestLocation} className="w-full rounded-full bg-accent px-4 py-2.5 font-display text-xs font-semibold uppercase tracking-wide text-black">
                Share Location
              </button>
            )}
            {locationState === "requesting" && <PendingRow text="Waiting for browser permission…" />}
            {locationState === "granted" && <ResultRow tone="accent" text="Location shared. Thank you." />}
            {locationState === "denied" && <ResultRow tone="danger" text="Location permission denied." />}
            {locationState === "unavailable" && <ResultRow tone="neutral" text="Location unavailable on this device." />}
            {locationState === "error" && <ResultRow tone="danger" text="Something went wrong. You may continue." />}
            {locationState !== "idle" && locationState !== "requesting" && (
              <button onClick={advanceAfterLocation} className="w-full rounded-full border border-white/10 px-4 py-2.5 font-display text-xs uppercase tracking-wide text-[color:var(--color-text)] hover:bg-white/5">
                Continue
              </button>
            )}
          </div>
        )}

        {step === "camera" && (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-[color:var(--color-text-dim)]">Your browser will ask for permission to use your camera.</p>
            {cameraState === "idle" && (
              <button onClick={requestCamera} className="w-full rounded-full bg-accent px-4 py-2.5 font-display text-xs font-semibold uppercase tracking-wide text-black">
                Enable Camera
              </button>
            )}
            {cameraState === "requesting" && <PendingRow text="Waiting for browser permission…" />}
            {cameraState === "granted" && (
              <div className="space-y-3">
                <video ref={videoRef} muted playsInline className="w-full rounded-lg border border-[color:var(--color-panel-border)]" />
                {!captured ? (
                  <button onClick={capturePhoto} className="w-full rounded-full bg-accent px-4 py-2.5 font-display text-xs font-semibold uppercase tracking-wide text-black">
                    Capture Photo
                  </button>
                ) : (
                  <ResultRow tone="accent" text="Photo captured. Thank you." />
                )}
              </div>
            )}
            {cameraState === "denied" && <ResultRow tone="danger" text="Camera permission denied." />}
            {cameraState === "unavailable" && <ResultRow tone="neutral" text="Camera unavailable on this device." />}
            {cameraState === "error" && <ResultRow tone="danger" text="Something went wrong. You may continue." />}
            {cameraState !== "idle" && cameraState !== "requesting" && cameraState !== "granted" && (
              <button onClick={() => setStep("done")} className="w-full rounded-full border border-white/10 px-4 py-2.5 font-display text-xs uppercase tracking-wide text-[color:var(--color-text)] hover:bg-white/5">
                Continue
              </button>
            )}
          </div>
        )}

        {step === "done" && (
          <div className="mt-4 space-y-3 text-center">
            <p className="text-3xl">✓</p>
            <p className="font-display text-sm uppercase tracking-wide text-accent">Verification Complete</p>
            <p className="text-sm text-[color:var(--color-text-dim)]">
              Thank you. You may now close this page.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

function PendingRow({ text }: { text: string }) {
  return <p className="rounded-lg border border-white/10 bg-white/5 p-3 text-center text-xs text-[color:var(--color-text-dim)]">{text}</p>;
}

function ResultRow({ tone, text }: { tone: "accent" | "danger" | "neutral"; text: string }) {
  const cls =
    tone === "accent"
      ? "border-accent/40 text-accent bg-[color:var(--color-accent-soft)]"
      : tone === "danger"
        ? "border-red-800/50 text-red-300 bg-red-500/10"
        : "border-white/10 text-[color:var(--color-text-dim)] bg-white/5";
  return <p className={`rounded-lg border p-3 text-center text-xs ${cls}`}>{text}</p>;
}
