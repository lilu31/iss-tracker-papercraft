import L from "leaflet";
import { ISS_SVG_MARKUP } from "./ISSIcon";

/**
 * Leaflet-spezifischer Teil des ISS-Icons.
 *
 * Bewusst getrennt von `ISSIcon.tsx`: Leaflet greift beim Laden auf `window`
 * zu, dieses Modul darf deshalb nur aus der Karte importiert werden - und die
 * Karte laeuft ueber `dynamic(..., { ssr: false })` ausschliesslich im Browser.
 */

const MARKER_INNER_CLASSES =
  "relative block h-14 w-14 animate-bob drop-shadow-[0_6px_6px_rgba(122,94,58,0.45)]";

/**
 * Baut das Leaflet-Icon.
 *
 * Der wippende Inhalt liegt in einem eigenen Element: Leaflet positioniert das
 * aeussere Markerelement per `transform`, die Animation laeuft auf dem inneren
 * - so ueberschreiben sich die beiden nicht.
 */
export function createIssIcon(): L.DivIcon {
  return L.divIcon({
    html: `
      <span class="relative block h-14 w-14">
        <span class="pointer-events-none absolute inset-0 rounded-full bg-accent-red/25 animate-halo"></span>
        <span class="${MARKER_INNER_CLASSES}">${ISS_SVG_MARKUP}</span>
      </span>`,
    // Eigener Klassenname statt "leaflet-div-icon": sonst legt Leaflet einen
    // weissen Kasten mit Rahmen unter das Icon.
    className: "iss-marker",
    iconSize: [56, 56],
    iconAnchor: [28, 28],
  });
}
