/**
 * Tile layers for hostel + coaching maps.
 *
 * Street (default): OpenStreetMap — free, no API key, works at high zoom
 * in Kota (no "Map data not yet available").
 *
 * Satellite: Esri World Imagery — free for reasonable use, shows buildings
 * and roofs similar to Google satellite (not Google itself).
 *
 * Esri Light Gray was dropped for street: it blanks out past ~zoom 16 in Kota.
 */

/** Street basemap. Free, no key. Full zoom coverage for Kota. */
export const MAP_TILE_URL =
  'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

export const MAP_TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

/** Satellite imagery (no key). Esri uses {z}/{y}/{x} order. */
export const MAP_SATELLITE_URL =
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

export const MAP_SATELLITE_ATTRIBUTION =
  'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community';

/**
 * Kota core + ~5 km buffer.
 * Leaflet maxBounds: [[south, west], [north, east]]
 */
export const KOTA_MAX_BOUNDS: [[number, number], [number, number]] = [
  [25.1, 75.76],
  [25.24, 75.92],
];

export const KOTA_MIN_ZOOM = 12;
export const KOTA_MAX_ZOOM = 18;

/** General Kota viewing area. Not a user location and not a hostel pin. */
export const KOTA_VIEW = {
  lat: 25.15,
  lng: 75.85,
  zoom: 13,
} as const;
