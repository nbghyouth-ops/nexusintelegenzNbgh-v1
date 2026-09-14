const SIGNATURES: { mime: string; bytes: number[] }[] = [
  { mime: "image/jpeg", bytes: [0xff, 0xd8, 0xff] },
  { mime: "image/png", bytes: [0x89, 0x50, 0x4e, 0x47] },
  { mime: "image/webp", bytes: [0x52, 0x49, 0x46, 0x46] }, // "RIFF" (WebP container)
];

/** Verifies the file's magic bytes match a claimed, allow-listed image MIME type. */
export function detectImageMime(buffer: Buffer): string | null {
  for (const sig of SIGNATURES) {
    if (buffer.length >= sig.bytes.length && sig.bytes.every((b, i) => buffer[i] === b)) {
      return sig.mime;
    }
  }
  return null;
}

const ALLOWED_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp"]);

/** Produces a safe, random storage-facing filename with no user input. */
export function safeStoredFilename(originalFilename: string): string {
  const ext = originalFilename.split(".").pop()?.toLowerCase() ?? "";
  const safeExt = ALLOWED_EXTENSIONS.has(ext) ? ext : "bin";
  return `${crypto.randomUUID()}.${safeExt}`;
}
