import type { IssApiResponse, IssPosition, IssVisibility } from "@/types";

/**
 * Datenquelle: wheretheiss.at.
 *
 * Bewusst diese API und nicht Open Notify: Open Notify laeuft nur ueber HTTP,
 * der Browser blockiert das von einer HTTPS-Seite als Mixed Content. Nach dem
 * Deploy bliebe die Karte damit leer.
 */
export const ISS_ENDPOINT = "https://api.wheretheiss.at/v1/satellites/25544";

/** Abstand zwischen zwei Abfragen (Anforderung F3). */
export const POLL_INTERVAL_MS = 5_000;

/** Fehler mit einer Meldung, die direkt angezeigt werden darf. */
export class IssApiError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "IssApiError";
  }
}

const VISIBILITIES = ["daylight", "eclipsed"] as const satisfies readonly IssVisibility[];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isIssVisibility(value: unknown): value is IssVisibility {
  return VISIBILITIES.some((candidate) => candidate === value);
}

/**
 * Type Guard statt Cast: die API ist eine fremde Quelle, ihre Antwort wird
 * geprueft bevor irgendetwas damit gerechnet wird.
 */
function isIssApiResponse(value: unknown): value is IssApiResponse {
  if (!isRecord(value)) return false;

  return (
    isFiniteNumber(value.latitude) &&
    isFiniteNumber(value.longitude) &&
    isFiniteNumber(value.altitude) &&
    isFiniteNumber(value.velocity) &&
    isFiniteNumber(value.timestamp) &&
    isIssVisibility(value.visibility)
  );
}

/** Holt die aktuelle Position und reduziert sie auf `IssPosition`. */
export async function fetchIssPosition(signal?: AbortSignal): Promise<IssPosition> {
  let response: Response;

  try {
    response = await fetch(ISS_ENDPOINT, { signal, cache: "no-store" });
  } catch (cause) {
    // Abbruch durch den Aufrufer ist kein Fehlerfall, sondern gewollt.
    if (signal?.aborted) throw cause;
    throw new IssApiError("Wir erreichen die ISS gerade nicht. Ist das Internet da?", {
      cause,
    });
  }

  if (!response.ok) {
    throw new IssApiError(
      `Die ISS hat mit ${response.status} geantwortet. Gleich nochmal versuchen!`,
    );
  }

  const data: unknown = await response.json();

  if (!isIssApiResponse(data)) {
    throw new IssApiError("Die ISS hat etwas geschickt, das wir nicht lesen konnten.");
  }

  return {
    latitude: data.latitude,
    longitude: data.longitude,
    altitude: data.altitude,
    velocity: data.velocity,
    timestamp: data.timestamp,
    visibility: data.visibility,
  };
}
