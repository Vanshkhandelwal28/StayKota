import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LocateFixed, MapPin } from 'lucide-react';
import type { Hostel } from '../../types';
import { KOTA_VIEW, MAP_TILE_ATTRIBUTION, MAP_TILE_URL } from '../../config/map';
import {
  formatStraightLine,
  straightLineMetres,
  toCoordinates,
  type Coordinates,
} from '../../lib/coordinates';

const FALLBACK_PHOTO =
  'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=70';

function pinIcon(selected: boolean) {
  return L.divIcon({
    className: 'staykota-pin',
    html: `<span class="staykota-pin-dot${selected ? ' is-selected' : ''}"></span>`,
    iconSize: [28, 36],
    iconAnchor: [14, 34],
    popupAnchor: [0, -28],
  });
}

const userIcon = L.divIcon({
  className: 'staykota-pin',
  html: '<span class="staykota-user-dot"></span>',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

function startingRent(hostel: Hostel): number | null {
  if (!hostel.roomTypes.length) return null;
  const rents = hostel.roomTypes.map((r) => r.rent).filter((n) => Number.isFinite(n));
  if (!rents.length) return null;
  return Math.min(...rents);
}

function MapReady({ onReady }: { onReady: () => void }) {
  const map = useMap();
  useEffect(() => {
    onReady();
    const fix = () => map.invalidateSize();
    const t = window.setTimeout(fix, 80);
    window.addEventListener('resize', fix);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('resize', fix);
    };
  }, [map, onReady]);
  return null;
}

function FlyTo({ target }: { target: Coordinates | null }) {
  const map = useMap();
  useEffect(() => {
    if (!target) return;
    map.setView([target.lat, target.lng], Math.max(map.getZoom(), 14), { animate: true });
  }, [map, target]);
  return null;
}

type GeoError =
  | 'denied'
  | 'unavailable'
  | 'timeout'
  | 'unsupported'
  | 'invalid';

const GEO_COPY: Record<GeoError, string> = {
  denied: 'Location access was denied. You can still browse by locality.',
  unavailable: 'Your position is unavailable right now. The map still works.',
  timeout: 'Finding your location timed out. Try again if you want.',
  unsupported: 'This browser does not share location. Filters still work.',
  invalid: 'The browser returned an unusable location. It was not used.',
};

interface DiscoveryMapProps {
  hostels: Hostel[];
  onShowList: () => void;
}

export function DiscoveryMap({ hostels, onShowList }: DiscoveryMapProps) {
  const [ready, setReady] = useState(false);
  const [tileFailed, setTileFailed] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [geoError, setGeoError] = useState<GeoError | null>(null);
  const [locating, setLocating] = useState(false);

  const mapped = useMemo(
    () =>
      hostels.flatMap((hostel) => {
        const coords = toCoordinates(hostel.latitude, hostel.longitude);
        return coords ? [{ hostel, coords }] : [];
      }),
    [hostels],
  );

  const locate = () => {
    if (!navigator.geolocation) {
      setGeoError('unsupported');
      return;
    }
    setLocating(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = toCoordinates(pos.coords.latitude, pos.coords.longitude);
        setLocating(false);
        if (!coords) {
          setGeoError('invalid');
          return;
        }
        setUserLocation(coords);
      },
      (err) => {
        setLocating(false);
        if (err.code === err.PERMISSION_DENIED) setGeoError('denied');
        else if (err.code === err.TIMEOUT) setGeoError('timeout');
        else setGeoError('unavailable');
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-[#506474]">
          {mapped.length === 0
            ? 'No mapped listings in this filter.'
            : `${mapped.length} mapped stay${mapped.length === 1 ? '' : 's'} · ${hostels.length - mapped.length} without a pin`}
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={locate}
            disabled={locating}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-full border border-[#073B55]/20 bg-white text-sm font-semibold text-[#073B55] hover:bg-[#F4F8F8] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#073B55] disabled:opacity-60"
          >
            <LocateFixed className="w-4 h-4" aria-hidden />
            {locating ? 'Locating…' : 'Near me'}
          </button>
          <button
            type="button"
            onClick={onShowList}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-full bg-[#073B55] text-white text-sm font-semibold hover:bg-[#176A96] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E7B43B]"
          >
            List view
          </button>
        </div>
      </div>

      {geoError && (
        <p className="text-sm text-[#073B55] bg-[#F4F8F8] border border-[#073B55]/15 rounded-xl px-3 py-2" role="status">
          {GEO_COPY[geoError]}
        </p>
      )}

      <div className="staykota-map relative h-[min(70vh,640px)] min-h-[420px] rounded-[1.25rem] overflow-hidden border border-[#E1E7EA] bg-[#F4F8F8]">
        {!ready && (
          <div className="absolute inset-0 z-[5] flex items-center justify-center text-sm text-[#506474] pointer-events-none">
            Loading map…
          </div>
        )}
        {tileFailed && (
          <div className="absolute top-3 left-3 right-3 z-[6] rounded-xl bg-white/95 border border-[#E1E7EA] px-3 py-2 text-sm text-[#073B55] shadow-sm">
            Map tiles did not load. List view still has every filtered stay.
          </div>
        )}
        {mapped.length === 0 && ready && (
          <div className="absolute bottom-4 left-3 right-3 z-[6] rounded-xl bg-white/95 border border-[#E1E7EA] px-3 py-2 text-sm text-[#073B55] shadow-sm">
            <span className="inline-flex items-start gap-2">
              <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-[#E7B43B]" aria-hidden />
              <span>
                These listings do not have building coordinates, so nothing is pinned.
                The Kota view is only a starting area, not a hostel location.
              </span>
            </span>
          </div>
        )}
        <MapContainer
          center={[KOTA_VIEW.lat, KOTA_VIEW.lng]}
          zoom={KOTA_VIEW.zoom}
          scrollWheelZoom
          className="h-full w-full"
        >
          <MapReady onReady={() => setReady(true)} />
          <FlyTo target={userLocation} />
          <TileLayer
            attribution={MAP_TILE_ATTRIBUTION}
            url={MAP_TILE_URL}
            eventHandlers={{ tileerror: () => setTileFailed(true) }}
          />
          {userLocation && (
            <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon} zIndexOffset={500}>
              <Popup>
                <p className="text-sm font-semibold text-[#073B55]">Your location</p>
                <p className="text-xs text-[#506474]">Used only in this session. Not saved.</p>
              </Popup>
            </Marker>
          )}
          {mapped.map(({ hostel, coords }) => {
            const rent = startingRent(hostel);
            const distance =
              userLocation != null
                ? formatStraightLine(straightLineMetres(userLocation, coords))
                : '';
            const selected = selectedId === hostel.id;
            return (
              <Marker
                key={hostel.id}
                position={[coords.lat, coords.lng]}
                icon={pinIcon(selected)}
                eventHandlers={{ click: () => setSelectedId(hostel.id) }}
              >
                <Popup>
                  <div className="w-52 text-[#073B55]">
                    <img
                      src={hostel.coverImage || FALLBACK_PHOTO}
                      alt=""
                      className="w-full h-24 object-cover rounded-lg bg-[#F4F6F7]"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = FALLBACK_PHOTO;
                      }}
                    />
                    <p className="mt-2 font-semibold leading-snug">{hostel.name}</p>
                    {hostel.locality ? (
                      <p className="text-xs text-[#506474]">{hostel.locality}, Kota</p>
                    ) : (
                      <p className="text-xs text-[#506474]">Locality unavailable</p>
                    )}
                    {rent != null ? (
                      <p className="text-sm mt-1">
                        ₹{rent.toLocaleString('en-IN')}
                        <span className="text-xs text-[#506474]"> / month from</span>
                      </p>
                    ) : (
                      <p className="text-xs text-[#506474] mt-1">Rent unavailable</p>
                    )}
                    {distance && (
                      <p className="text-xs text-[#506474] mt-1">
                        About {distance} straight-line — not a route.
                      </p>
                    )}
                    <p className="text-[11px] text-[#506474] mt-1">
                      Pin is the saved coordinate. Not a verified visit or a booking.
                    </p>
                    <Link
                      to={`/hostel/${hostel.id}`}
                      className="mt-2 inline-flex h-8 items-center rounded-full bg-[#073B55] px-3 text-xs font-semibold text-white"
                    >
                      View details
                    </Link>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}
