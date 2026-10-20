/**
 * Tile layer for the hostel + coaching map.
 *
 * Carto Positron is free for reasonable public use, lighter than standard OSM
 * (fewer shop / temple / restaurant labels), and keeps roads + locality names.
 * Your hostel and coaching pins stay fully under app control.
 *
 * Docs: https://github.com/CartoDB/basemap-styles
 * Attribution required. Do not commit API keys here.
 *
 * Before very high production traffic, confirm terms or switch to a self-hosted
 * / commercial OSM-compatible host.
 */
export const MAP_TILE_URL =
  'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

export const MAP_TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

/** General Kota viewing area. Not a user location and not a hostel pin. */
export const KOTA_VIEW = {
  lat: 25.182,
  lng: 75.852,
  zoom: 13,
} as const;
