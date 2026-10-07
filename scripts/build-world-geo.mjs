/**
 * Erzeugt src/data/world.geo.json aus der Natural-Earth-110m-Topologie.
 *
 * Warum vorgeneriert statt zur Laufzeit?
 * Die App laedt bewusst keine externen Karten-Tiles: das haelt den Papercraft-Look
 * (eigene Pastellfarben statt Foto-Kacheln) und vermeidet jede Mixed-Content-Gefahr.
 *
 * Ausfuehren: npm run build:geo
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { feature } from "topojson-client";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = resolve(root, "node_modules/world-atlas/countries-110m.json");
const target = resolve(root, "src/data/world.geo.json");

/** Koordinaten auf 2 Nachkommastellen runden - bei 110m-Aufloesung unsichtbar,
 *  spart aber rund die Haelfte der Dateigroesse. */
const round = (n) => Math.round(n * 100) / 100;

/**
 * Suedlich davon wird nichts gezeichnet. Die Antarktis frisst in Mercator ein
 * Drittel der Flaeche, und "Fr. S. Antarctic Lands" bringt einen grossen
 * Keil bis zum Pol mit - beides lenkt auf einer Kinderkarte nur ab.
 */
const SOUTHERN_LIMIT = -60;

const onBoundary = (lon) => Math.abs(Math.abs(lon) - 180) < 1e-9;

/**
 * Zerlegt einen Ring, der den 180. Laengengrad uebertritt, in mehrere Ringe.
 *
 * Ohne das zieht Leaflet die Verbindungslinie quer ueber die ganze Karte:
 * Russland und Fidschi reichen ueber den Antimeridian, und ihre Ringe
 * springen dort von -180 auf +180. Das ist als Strich ueber die ganze
 * Weltkarte sichtbar.
 *
 * Vorgehen: Laengengrade fortlaufend machen ("unroll"), an jeder ueber-
 * tretenen Fenstergrenze aufschneiden, und jedes Stueck einzeln zurueck in
 * [-180, 180] schieben.
 */
function splitRingAtAntimeridian(ring) {
  // GeoJSON schliesst den Ring explizit - der doppelte Punkt fliegt raus.
  const points = ring.slice(0, -1);
  if (points.length < 3) return [ring];

  // 1) fortlaufend machen: jeder Punkt so verschieben, dass er nahe am Vorgaenger liegt
  const unrolled = [points[0].slice()];
  for (let i = 1; i < points.length; i++) {
    const previous = unrolled[i - 1][0];
    const lon = points[i][0] - Math.round((points[i][0] - previous) / 360) * 360;
    unrolled.push([lon, points[i][1]]);
  }

  // 2) an jeder uebertretenen Grenze aufschneiden
  const pieces = [];
  let current = [unrolled[0]];
  for (let i = 1; i < unrolled.length; i++) {
    const previous = current[current.length - 1];
    const point = unrolled[i];
    const before = Math.floor((previous[0] + 180) / 360);
    const after = Math.floor((point[0] + 180) / 360);

    if (before === after) {
      current.push(point);
      continue;
    }

    const boundary = 180 + 360 * Math.min(before, after);
    const t = (boundary - previous[0]) / (point[0] - previous[0]);
    const crossing = [boundary, previous[1] + t * (point[1] - previous[1])];
    current.push(crossing);
    pieces.push(current);
    current = [crossing, point];
  }
  pieces.push(current);

  // 3) erstes und letztes Stueck gehoeren zusammen, wenn der Ring mitten im
  //    Polygon beginnt. Sonst wuerde beim Schliessen eine Sehne quer durchs
  //    Land gezogen.
  if (
    pieces.length > 1 &&
    !onBoundary(pieces[0][0][0]) &&
    !onBoundary(pieces[pieces.length - 1].at(-1)[0])
  ) {
    pieces[0] = pieces[pieces.length - 1].concat(pieces[0]);
    pieces.pop();
  }

  // 4) jedes Stueck zurueck in [-180, 180] schieben und schliessen
  return pieces
    .map((piece) => {
      const shift = -360 * Math.floor((piece[0][0] + 180) / 360);
      const shifted = piece.map(([lon, lat]) => [round(lon + shift), round(lat)]);
      shifted.push(shifted[0]);
      return shifted;
    })
    .filter((piece) => piece.length >= 4);
}

const hasAntimeridianCrossing = (ring) =>
  ring.some((point, i) => i > 0 && Math.abs(point[0] - ring[i - 1][0]) > 180);

/** Koordinaten eines Rings runden und den Ring wieder schliessen. */
const roundRing = (ring) => {
  const rounded = ring.map(([lon, lat]) => [round(lon), round(lat)]);
  rounded[rounded.length - 1] = rounded[0];
  return rounded;
};

/** Polygon -> Liste fertiger Ringe (aeusserer Ring plus etwaige Loecher). */
function processPolygon(rings) {
  const [outer, ...holes] = rings;

  if (!hasAntimeridianCrossing(outer)) {
    // Unveraendert uebernehmen, aber genauso runden wie die aufgeteilten Ringe -
    // sonst traegt der Grossteil der Datei volle Fliesskomma-Genauigkeit.
    return [{ rings: [roundRing(outer), ...holes.map(roundRing)] }];
  }

  // Loecher gibt es in diesem Datensatz nur bei Laendern, die den
  // Antimeridian nicht uebertreten - die Aufteilung betrifft sie also nicht.
  return splitRingAtAntimeridian(outer).map((ring) => ({ rings: [ring] }));
}

const topology = JSON.parse(readFileSync(source, "utf8"));
const collection = feature(topology, topology.objects.countries);

let splitCount = 0;
let droppedCount = 0;

const features = [];

for (const country of collection.features) {
  const polygons =
    country.geometry.type === "Polygon"
      ? [country.geometry.coordinates]
      : country.geometry.coordinates;

  const kept = [];
  for (const polygon of polygons) {
    for (const { rings } of processPolygon(polygon)) {
      const outer = rings[0];
      if (Math.max(...outer.map(([, lat]) => lat)) < SOUTHERN_LIMIT) {
        droppedCount += 1;
        continue;
      }
      kept.push(rings);
    }
  }

  if (kept.length === 0) continue;
  if (kept.length !== polygons.length) splitCount += 1;

  features.push({
    type: "Feature",
    id: country.id,
    properties: { name: country.properties?.name ?? "Unbekannt" },
    geometry:
      kept.length === 1
        ? { type: "Polygon", coordinates: kept[0] }
        : { type: "MultiPolygon", coordinates: kept },
  });
}

const geoJson = { type: "FeatureCollection", features };

mkdirSync(dirname(target), { recursive: true });
writeFileSync(target, JSON.stringify(geoJson));

const kb = (JSON.stringify(geoJson).length / 1024).toFixed(0);
console.log(`${features.length} Laender -> src/data/world.geo.json (${kb} KB)`);
console.log(`${splitCount} Laender am Antimeridian aufgeteilt, ${droppedCount} antarktische Ringe verworfen`);
