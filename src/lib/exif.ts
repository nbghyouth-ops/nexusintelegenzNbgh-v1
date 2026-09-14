import exifr from "exifr";

export type ExifResult = {
  hasGps: boolean;
  latitude: number | null;
  longitude: number | null;
  capturedAt: Date | null;
  cameraMake: string | null;
  cameraModel: string | null;
  orientation: number | null;
  raw: Record<string, unknown> | null;
};

/**
 * Extracts EXIF metadata from an image buffer. Never fabricates GPS data —
 * if none is present, hasGps is false and latitude/longitude are null,
 * which the UI must render as "LOCATION_UNAVAILABLE".
 */
export async function extractExif(buffer: Buffer): Promise<ExifResult> {
  try {
    const data = await exifr.parse(buffer, {
      gps: true,
      pick: [
        "latitude",
        "longitude",
        "DateTimeOriginal",
        "CreateDate",
        "Make",
        "Model",
        "Orientation",
      ],
    });

    if (!data) {
      return {
        hasGps: false,
        latitude: null,
        longitude: null,
        capturedAt: null,
        cameraMake: null,
        cameraModel: null,
        orientation: null,
        raw: null,
      };
    }

    const hasGps =
      typeof data.latitude === "number" && typeof data.longitude === "number";

    return {
      hasGps,
      latitude: hasGps ? data.latitude : null,
      longitude: hasGps ? data.longitude : null,
      capturedAt: data.DateTimeOriginal || data.CreateDate || null,
      cameraMake: data.Make ?? null,
      cameraModel: data.Model ?? null,
      orientation: typeof data.Orientation === "number" ? data.Orientation : null,
      raw: JSON.parse(JSON.stringify(data)),
    };
  } catch {
    return {
      hasGps: false,
      latitude: null,
      longitude: null,
      capturedAt: null,
      cameraMake: null,
      cameraModel: null,
      orientation: null,
      raw: null,
    };
  }
}
