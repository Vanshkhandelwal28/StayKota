/**
 * Tile layer for the hostel map.
 *
 * Default is the public OpenStreetMap tile service, suitable for local
 * development only. The OSM Foundation tile usage policy does not allow
 * heavy or commercial production traffic:
 * https://operations.osmfoundation.org/policies/tiles/
 *
 * Before a production deploy, point this URL at a provider whose terms
 * you have accepted (for example a self-hosted style or a commercial
 * OSM-compatible host). Do not commit API keys here.
 */
export const MAP_TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

export const MAP_TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

/** General Kota viewing area. Not a user location and not a hostel pin. */
export const KOTA_VIEW = {
  lat: 25.182,
  lng: 75.852,
  zoom: 13,
} as const;
