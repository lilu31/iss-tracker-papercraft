import { cn } from "@/lib/utils";

/**
 * Das Paper-ISS: Solarpaneele aus gelbem Tonpapier, Rumpf aus weissem Karton,
 * roter Punkt als Modul.
 *
 * Das Markup liegt als Konstante vor, weil Leaflets Marker sein Icon als
 * HTML-String erwartet. Marker und UI lesen so aus derselben Quelle, statt
 * zwei Varianten zu pflegen, die auseinanderlaufen koennen.
 *
 * Es ist statisches, lokales Markup - hier wird kein Nutzer-Input eingesetzt.
 *
 * WICHTIG: Diese Datei darf Leaflet NICHT importieren. Sie wird auch vom
 * Infofenster benutzt, das im Server-Rendering laeuft - Leaflet greift beim
 * Laden auf `window` zu und wuerde den Build abbrechen. Das Marker-Icon liegt
 * deshalb getrennt in `issMarker.ts`.
 */
export const ISS_SVG_MARKUP = `
<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Internationale Raumstation">
  <rect x="8" y="30" width="48" height="4" rx="2" fill="#8A7B66"/>
  <g stroke="#C98F1F" stroke-width="1.5">
    <rect x="4" y="16" width="18" height="32" rx="3" fill="#F2B33D" stroke-width="2"/>
    <line x1="4" y1="27" x2="22" y2="27"/>
    <line x1="4" y1="38" x2="22" y2="38"/>
    <line x1="13" y1="16" x2="13" y2="48"/>
  </g>
  <g stroke="#C98F1F" stroke-width="1.5">
    <rect x="42" y="16" width="18" height="32" rx="3" fill="#F2B33D" stroke-width="2"/>
    <line x1="42" y1="27" x2="60" y2="27"/>
    <line x1="42" y1="38" x2="60" y2="38"/>
    <line x1="51" y1="16" x2="51" y2="48"/>
  </g>
  <rect x="24" y="23" width="16" height="18" rx="6" fill="#FFFDF8" stroke="#4A3F35" stroke-width="2.5"/>
  <circle cx="32" cy="32" r="3.5" fill="#E4572E"/>
</svg>
`;

/** Dieselbe Grafik als React-Komponente, fuer Karten-Legende und Overlay. */
export function IssIcon({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("inline-block", className)}
      dangerouslySetInnerHTML={{ __html: ISS_SVG_MARKUP }}
    />
  );
}
