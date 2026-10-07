"use client";

import { useEffect, useMemo, useRef } from "react";
import { GeoJSON, MapContainer, Marker, useMap } from "react-leaflet";
import type { GeoJsonObject } from "geojson";
import type { LatLngBoundsExpression, LatLngExpression, PathOptions } from "leaflet";
import worldGeo from "@/data/world.geo.json";
import type { IssPosition } from "@/types";
import { createIssIcon } from "./issMarker";

/**
 * Die Karte laedt bewusst keinen Tile-Server. Statt Luftbild-Kacheln werden die
 * Laendergrenzen aus der mitgelieferten Natural-Earth-Datei gezeichnet und in
 * Bastelpapier-Farben gefuellt. Das ergibt den Diorama-Look, spart externe
 * Requests und kann gar nicht erst Mixed Content ausloesen.
 */
const COUNTRIES = worldGeo as unknown as GeoJsonObject;

const COUNTRY_STYLE: PathOptions = {
  fillColor: "#A9CF9B", // Papier-Wiese
  fillOpacity: 1,
  color: "#FDF6E9", // cremefarbene Schnittkante
  weight: 1.5,
};

/**
 * Die ISS umkreist die Erde in einem Band von etwa 52 Grad Nord bis 52 Grad
 * Sued - weiter kommt sie nie. Die Karte wird auf dieses Band eingepasst,
 * damit die Station immer im Bild ist, egal wo sie gerade fliegt.
 */
const ORBIT_BAND: LatLngBoundsExpression = [
  [-60, -180],
  [60, 180],
];

/** Passt den sichtbaren Ausschnitt beim Laden und bei jeder Groessenaenderung an. */
function FitOrbitBand() {
  const map = useMap();

  useEffect(() => {
    const fit = () => map.fitBounds(ORBIT_BAND, { animate: false });
    fit();
    map.on("resize", fit);
    return () => {
      map.off("resize", fit);
    };
  }, [map]);

  return null;
}

/**
 * Zoomstufe im Mitflug-Modus.
 *
 * Auf der ganzen Weltkarte legt die ISS pro zehn Sekunden nur rund zwei Pixel
 * zurueck - die Bewegung ist dann schlicht nicht zu sehen. Naeher herangezoomt
 * wandert sie sichtbar, und weil die Karte mitzieht, sieht man stattdessen die
 * Erdoberflaeche vorbeiziehen.
 */
const FOLLOW_ZOOM = 4;

/**
 * Steuert den Kartenausschnitt.
 *
 * Zwei getrennte Effekte mit Absicht: der eine reagiert nur auf das Umschalten,
 * der andere nur auf neue Messwerte. Liefe beides in einem Effekt, wuerde die
 * Karte im Nicht-Mitflug-Modus alle fuenf Sekunden zurueckspringen und dem
 * Nutzer beim Verschieben in die Quere kommen.
 */
function FollowIss({
  position,
  follow,
  overlayOpen,
}: {
  position: LatLngExpression | null;
  follow: boolean;
  overlayOpen: boolean;
}) {
  const map = useMap();
  const latest = useRef(position);
  latest.current = position;

  // Beim Oeffnen des Infofensters einmal zur ISS schwenken, damit sie unter
  // der Papierkarte nicht verdeckt wird.
  useEffect(() => {
    if (overlayOpen && latest.current) {
      map.panTo(latest.current, { animate: true, duration: 0.8 });
    }
  }, [overlayOpen, map]);

  // Nur beim Umschalten: zurueck auf die ganze Welt.
  useEffect(() => {
    if (!follow) map.fitBounds(ORBIT_BAND, { animate: true });
  }, [follow, map]);

  // Bei jeder neuen Messung mitziehen.
  useEffect(() => {
    if (follow && latest.current) {
      map.setView(latest.current, FOLLOW_ZOOM, { animate: true, duration: 1 });
    }
  }, [follow, position, map]);

  return null;
}

export interface WorldMapProps {
  position: IssPosition | null;
  overlayOpen: boolean;
  /** Mitflug-Modus: Karte zoomt heran und zieht mit der ISS mit. */
  follow: boolean;
  /** Klick auf das ISS-Icon schaltet das Infofenster um. */
  onToggleOverlay: () => void;
}

export default function WorldMap({
  position,
  overlayOpen,
  follow,
  onToggleOverlay,
}: WorldMapProps) {
  // Das Icon einmal bauen - ein neues pro Render wuerde Leaflet neu aufbauen lassen.
  const issIcon = useMemo(() => createIssIcon(), []);

  const issLatLng: LatLngExpression | null = position
    ? [position.latitude, position.longitude]
    : null;

  return (
    <MapContainer
      center={[0, 0]}
      zoom={2}
      minZoom={1}
      maxZoom={6}
      // Ohne das rundet Leaflet den Zoom auf ganze Stufen und das Orbit-Band
      // passt nicht exakt in den Ausschnitt - ein Stueck Welt fiele raus.
      zoomSnap={0}
      zoomControl={false}
      attributionControl={false}
      worldCopyJump
      className="h-full w-full bg-ocean"
    >
      <FitOrbitBand />
      <FollowIss position={issLatLng} follow={follow} overlayOpen={overlayOpen} />

      <GeoJSON data={COUNTRIES} style={COUNTRY_STYLE} />

      {issLatLng && (
        <Marker
          position={issLatLng}
          icon={issIcon}
          eventHandlers={{ click: onToggleOverlay }}
        />
      )}
    </MapContainer>
  );
}
