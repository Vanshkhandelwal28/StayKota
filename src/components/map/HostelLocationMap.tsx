import { useEffect, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';
import type { Hostel } from '../../types';
import { MAP_TILE_ATTRIBUTION, MAP_TILE_URL } from '../../config/map';
import { toCoordinates } from '../../lib/coordinates';

const pin = L.divIcon({
  className: 'staykota-pin',
  html: '<span class="staykota-pin-dot is-selected"></span>',
  iconSize: [28, 36],
  iconAnchor: [14, 34],
  popupAnchor: [0, -28],
});

function FixSize() {
  const map = useMap();
  useEffect(() => {
    const fix = () => map.invalidateSize();
    const t = window.setTimeout(fix, 60);
    window.addEventListener('resize', fix);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('resize', fix);
    };
  }, [map]);
  return null;
}

export function HostelLocationMap({ hostel }: { hostel: Hostel }) {
  const coords = toCoordinates(hostel.latitude, hostel.longitude);
  const [tileFailed, setTileFailed] = useState(false);

  if (!coords) {
    return (
      <div className="rounded-[1.25rem] border border-dashed border-[#073B55]/25 bg-[#F4F8F8] px-4 py-8 text-sm text-[#073B55] text-center">
        Map location is not available for this listing.
      </div>
    );
  }

  const accuracy =
    hostel.locationAccuracy === 'published'
      ? 'Published coordinate.'
      : hostel.locationAccuracy === 'osm'
        ? 'Taken from a public map listing.'
        : 'Approximate demo pin inside the stated locality — not a verified address.';

  return (
    <div className="space-y-2">
      <div className="staykota-map relative h-64 sm:h-80 rounded-[1.25rem] overflow-hidden border border-[#E1E7EA] bg-[#F4F8F8]">
        {tileFailed && (
          <div className="absolute top-3 left-3 right-3 z-[6] rounded-xl bg-white/95 border border-[#E1E7EA] px-3 py-2 text-sm text-[#073B55]">
            Map tiles did not load. The address above is still the listing text.
          </div>
        )}
        <MapContainer
          center={[coords.lat, coords.lng]}
          zoom={16}
          scrollWheelZoom={false}
          className="h-full w-full"
        >
          <FixSize />
          <TileLayer
            attribution={MAP_TILE_ATTRIBUTION}
            url={MAP_TILE_URL}
            eventHandlers={{ tileerror: () => setTileFailed(true) }}
          />
          <Marker position={[coords.lat, coords.lng]} icon={pin}>
            <Popup>
              <p className="font-semibold text-[#073B55]">{hostel.name}</p>
              <p className="text-xs text-[#506474]">{hostel.locality}, Kota</p>
            </Popup>
          </Marker>
        </MapContainer>
      </div>
      <p className="text-xs text-[#506474] flex items-start gap-1.5">
        <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[#E7B43B]" aria-hidden />
        <span>{accuracy} {hostel.isDemo ? 'Demo listing.' : ''}</span>
      </p>
    </div>
  );
}
