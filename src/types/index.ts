/**
 * Datenschicht der App.
 *
 * Zuerst die Typen, dann die UI: die Komponenten arbeiten ausschliesslich mit
 * `IssPosition`, nie direkt mit der Rohantwort der API.
 */

/** Tag- oder Nachtseite der Umlaufbahn. */
export type IssVisibility = "daylight" | "eclipsed";

/**
 * Unvalidierte Rohantwort von `api.wheretheiss.at/v1/satellites/25544`.
 * Wird immer erst durch den Type Guard in `lib/api.ts` geprueft, bevor sie
 * als `IssPosition` weiterverwendet wird.
 */
export interface IssApiResponse {
  name: string;
  id: number;
  latitude: number;
  longitude: number;
  altitude: number;
  velocity: number;
  visibility: IssVisibility;
  footprint: number;
  timestamp: number;
  daynum: number;
  solar_lat: number;
  solar_lon: number;
  units: "kilometers" | "miles";
}

/** Das normalisierte Modell, mit dem die gesamte UI arbeitet. */
export interface IssPosition {
  /** Breitengrad in Grad (-90 bis 90). */
  latitude: number;
  /** Laengengrad in Grad (-180 bis 180). */
  longitude: number;
  /** Hoehe in Kilometern. */
  altitude: number;
  /** Geschwindigkeit in km/h. */
  velocity: number;
  /** UNIX-Zeitstempel der Messung (Sekunden). */
  timestamp: number;
  /** Fuer die Tag/Nacht-Anzeige. */
  visibility: IssVisibility;
}

/**
 * `stale` ist der wichtige Zwischenzustand: die ISS war schon einmal da, der
 * letzte Abruf ist aber fehlgeschlagen. Dann bleiben die alten Werte stehen
 * und es erscheint nur ein Hinweis - statt die Karte leer zu raeumen.
 */
export type IssStatus = "loading" | "live" | "stale" | "error";
