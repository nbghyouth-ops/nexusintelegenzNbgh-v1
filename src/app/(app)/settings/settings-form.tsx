"use client";

import { useActionState } from "react";
import { updateSettingsAction, type ActionResult } from "@/lib/actions/settings";
import { Field, inputClass } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

type Settings = {
  trackingRetentionDays: number;
  locationRetentionDays: number;
  photoRetentionDays: number;
  cameraRetentionDays: number;
  auditRetentionDays: number;
  features: Record<string, boolean>;
};

const FEATURES = [
  ["tracking_enabled", "Tracking"],
  ["location_enabled", "Location"],
  ["camera_enabled", "Camera"],
  ["phone_enabled", "Phone Intelligence"],
  ["photos_enabled", "Photos"],
  ["analytics_enabled", "Analytics"],
] as const;

export function SettingsForm({ settings, readOnly }: { settings: Settings; readOnly: boolean }) {
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(updateSettingsAction, {});

  return (
    <form action={formAction} className="space-y-6">
      <fieldset disabled={readOnly} className="grid gap-4 sm:grid-cols-3">
        <Field label="Tracking retention (days)">
          <input type="number" name="trackingRetentionDays" defaultValue={settings.trackingRetentionDays} className={inputClass} />
        </Field>
        <Field label="Location retention (days)">
          <input type="number" name="locationRetentionDays" defaultValue={settings.locationRetentionDays} className={inputClass} />
        </Field>
        <Field label="Photo retention (days)">
          <input type="number" name="photoRetentionDays" defaultValue={settings.photoRetentionDays} className={inputClass} />
        </Field>
        <Field label="Camera retention (days)">
          <input type="number" name="cameraRetentionDays" defaultValue={settings.cameraRetentionDays} className={inputClass} />
        </Field>
        <Field label="Audit retention (days)">
          <input type="number" name="auditRetentionDays" defaultValue={settings.auditRetentionDays} className={inputClass} />
        </Field>
      </fieldset>

      <fieldset disabled={readOnly} className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {FEATURES.map(([key, label]) => (
          <label key={key} className="flex items-center gap-2 text-sm">
            <input type="checkbox" name={key} defaultChecked={settings.features[key]} className="accent-[--color-accent]" />
            {label}
          </label>
        ))}
      </fieldset>

      {state?.error ? <p className="text-sm text-red-400">{state.error}</p> : null}
      {!readOnly ? (
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save Settings"}
        </Button>
      ) : null}
    </form>
  );
}
