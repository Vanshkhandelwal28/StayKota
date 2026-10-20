/**
 * Tile layers for hostel + coaching maps.
 *
 * Street: CARTO Voyager (cleaner than standard OSM).
 * Satellite: Esri World Imagery (free for reasonable use).
 *
 * Set VITE_CARTO_API_KEY in Vercel or .env.local (same key as in your CARTO email).
 * Fallback key keeps the demo working if the env var is missing.
 * Free tier: 5,000,000 requests / month (UTC).
 */
const CARTO_KEY =
  import.meta.env.VITE_CARTO_API_KEY || 'cb1_4q50_1_0e10319187e80394facd422f';

/** Street map (default). */
export const MAP_TILE_URL =
  `https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png?key=${CARTO_KEY}`;

export const MAP_TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

/** Satellite imagery (no CARTO key). */
export const MAP_SATELLITE_URL =
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

export const MAP_SATELLITE_ATTRIBUTION =
  'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community';

/** Kota core + ~5 km. Leaflet: [[south, west], [north, east]] */
export const KOTA_MAX_BOUNDS: [[number, number], [number, number]] = [
  [25.12, 75.78],
  [25.22, 75.90],
];

export const KOTA_MIN_ZOOM = 12;
export const KOTA_MAX_ZOOM = 18;

/** General Kota viewing area. Not a user location and not a hostel pin. */
export const KOTA_VIEW = {
  lat: 25.15,
  lng: 75.85,
  zoom: 13,
} as const;
