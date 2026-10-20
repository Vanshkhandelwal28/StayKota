/**
 * Tile layer for the hostel + coaching map.
 *
 * CARTO Voyager (cleaner than standard OSM — fewer shop/temple labels).
 * Key is read from VITE_CARTO_API_KEY when set (Vercel / local .env).
 * A project default is used only so the public demo keeps working;
 * rotate the key in the CARTO dashboard if it is ever leaked or abused.
 *
 * Free tier: 5,000,000 map requests / month (UTC).
 * Docs: https://docs.carto.com/carto-basemaps
 * Attribution required.
 */
const CARTO_KEY =
  (typeof import.meta !== 'undefined' &&
    (import.meta as ImportMeta & { env?: { VITE_CARTO_API_KEY?: string } }).env
      ?.VITE_CARTO_API_KEY) ||
  'cb1_4q50_1_0e10319187e80394facd422f';

export const MAP_TILE_URL = `https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png?key=${CARTO_KEY}`;

export const MAP_TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

/** General Kota viewing area. Not a user location and not a hostel pin. */
export const KOTA_VIEW = {
  lat: 25.182,
  lng: 75.852,
  zoom: 13,
} as const;
