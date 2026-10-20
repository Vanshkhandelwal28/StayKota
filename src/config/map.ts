/**
 * Tile layers for hostel + coaching maps.
 *
 * Default street: Esri World Light Gray Canvas — free for reasonable use,
 * clean (few POI icons), no API key. Students mainly see our hostel +
 * coaching pins.
 *
 * Satellite: Esri World Imagery (also free for reasonable use).
 *
 * CARTO was dropped as default because their basemap CDN now returns
 * "API KEY REQUIRED" without a valid key.
 */

/** Clean light basemap. No API key. Note Esri uses {z}/{y}/{x} order. */
export const MAP_TILE_URL =
  'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}';

export const MAP_TILE_ATTRIBUTION =
  'Tiles &copy; Esri &mdash; Esri, HERE, Garmin, FAO, NOAA, USGS';

/** Satellite imagery (no key). */
export const MAP_SATELLITE_URL =
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

export const MAP_SATELLITE_ATTRIBUTION =
  'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community';

/**
 * Kota core + ~5 km buffer.
 * Leaflet maxBounds: [[south, west], [north, east]]
 * Students cannot pan far outside this area.
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
