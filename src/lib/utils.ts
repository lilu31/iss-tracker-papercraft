import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Tailwind-Klassen zusammenfuehren, ohne dass spaetere von frueheren ueberschrieben werden. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

const whole = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 0 });
const oneDecimal = new Intl.NumberFormat("de-DE", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

/**
 * 27549,6 km/h -> "28.000 km/h"
 * Auf Tausender gerundet, weil die genaue Zahl fuer Kinder nichts aussagt.
 */
export function formatVelocity(kmh: number): string {
  return `${whole.format(Math.round(kmh / 1000) * 1000)} km/h`;
}

/** 434,55 km -> "435 km" */
export function formatAltitude(km: number): string {
  return `${whole.format(Math.round(km))} km`;
}

/** -51.09 -> "51,1° S" */
export function formatLatitude(lat: number): string {
  return `${oneDecimal.format(Math.abs(lat))}° ${lat >= 0 ? "N" : "S"}`;
}

/** -116.03 -> "116,0° W" */
export function formatLongitude(lon: number): string {
  return `${oneDecimal.format(Math.abs(lon))}° ${lon >= 0 ? "O" : "W"}`;
}

/**
 * Vergleich, der ohne Vorwissen funktioniert: ein Passagierflugzeug schafft
 * etwa 900 km/h. Der Faktor wird aus dem Live-Wert berechnet, nicht fest
 * eingetragen.
 */
const AIRLINER_KMH = 900;

export function formatSpeedComparison(kmh: number): string {
  const factor = Math.max(1, Math.round(kmh / AIRLINER_KMH));
  return `${whole.format(factor)}-mal so schnell wie ein Flugzeug`;
}
