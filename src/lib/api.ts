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

/**
 * Wie lange nach einer Drosselung gewartet werden soll, bevor wieder gefragt
 * wird. Waehrend der Schulstunde sitzen schnell zwanzig Kinder hinter einer
 * IP - dann laufen die Abfragen in das Limit der API. Wer dann stur im
 * Fuenf-Sekunden-Takt weiterfragt, haelt die Sperre am Leben.
 */
export const RATE_LIMIT_PAUSE_MS = 30_000;

/** Fehler mit einer Meldung, die direkt angezeigt werden darf. */
export class IssApiError extends Error {
  /** Gesetzt, wenn der Server um Ruhe bittet - dann laenger pausieren. */
  readonly retryAfterMs: number | null;

  constructor(
    message: string,
    options?: { cause?: unknown; retryAfterMs?: number | null },
  ) {
    super(message, options);
    this.name = "IssApiError";
    this.retryAfterMs = options?.retryAfterMs ?? null;
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

/**
 * Liest den `Retry-After`-Kopf in Millisekunden.
 *
 * Bei einer Antwort von einer fremden Domain sieht JavaScript diesen Kopf nur,
 * wenn der Server ihn per `Access-Control-Expose-Headers` freigibt. Ist er
 * nicht lesbar, gilt unsere eigene Pause - der Normalfall, kein Fehler.
 */
function readRetryAfter(response: Response): number {
  const header = response.headers.get("retry-after");
  if (!header) return RATE_LIMIT_PAUSE_MS;

  const seconds = Number(header);
  if (Number.isFinite(seconds) && seconds > 0) return seconds * 1000;

  const date = Date.parse(header);
  if (!Number.isNaN(date)) return Math.max(0, date - Date.now());

  return RATE_LIMIT_PAUSE_MS;
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
    // 429 heisst "zu viele Anfragen". Ein `Retry-After` des Servers hat
    // Vorrang, sonst gilt unsere eigene Pause.
    const isThrottled = response.status === 429 || response.status === 503;
    throw new IssApiError(
      isThrottled
        ? "Wir haben die ISS zu oft gefragt. Sie braucht einen Moment Pause."
        : `Die ISS hat mit ${response.status} geantwortet. Gleich nochmal versuchen!`,
      { retryAfterMs: isThrottled ? readRetryAfter(response) : null },
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
