import { useEffect } from 'react';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { KOTA_VIEW, MAP_TILE_ATTRIBUTION, MAP_TILE_URL } from '../../config/map';
import type { Coordinates } from '../../lib/coordinates';

const pickerIcon = L.divIcon({
  className: 'staykota-pin',
  html: '<span class="staykota-pin-dot is-selected"></span>',
  iconSize: [28, 36],
  iconAnchor: [14, 34],
});

function ClickCatch({ onPick }: { onPick: (coords: Coordinates) => void }) {
  useMapEvents({
    click(event) {
      onPick({ lat: event.latlng.lat, lng: event.latlng.lng });
    },
  });
  return null;
}

function Recenter({ coords }: { coords: Coordinates | null }) {
  const map = useMap();
  useEffect(() => {
    if (!coords) return;
    map.panTo([coords.lat, coords.lng]);
  }, [coords, map]);
  return null;
}

interface LocationPickerMapProps {
  value: Coordinates | null;
  onChange: (value: Coordinates | null) => void;
}

export function LocationPickerMap({ value, onChange }: LocationPickerMapProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-700">Map pin (optional)</p>
          <p className="text-xs text-slate-500 mt-0.5">
            Click the map to drop a point, then drag it. This is not checked against the address and is not a verified location. Saved only in this browser with the rest of the listing.
          </p>
        </div>
        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="shrink-0 text-xs font-medium text-[#176A96] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#073B55] rounded"
          >
            Clear pin
          </button>
        )}
      </div>
      <div className="staykota-map h-64 rounded-xl overflow-hidden border border-slate-200">
        <MapContainer
          center={value ? [value.lat, value.lng] : [KOTA_VIEW.lat, KOTA_VIEW.lng]}
          zoom={value ? 15 : KOTA_VIEW.zoom}
          className="h-full w-full"
        >
          <TileLayer attribution={MAP_TILE_ATTRIBUTION} url={MAP_TILE_URL} />
          <ClickCatch onPick={onChange} />
          <Recenter coords={value} />
          {value && (
            <Marker
              position={[value.lat, value.lng]}
              icon={pickerIcon}
              draggable
              eventHandlers={{
                dragend: (event) => {
                  const latlng = event.target.getLatLng();
                  onChange({ lat: latlng.lat, lng: latlng.lng });
                },
              }}
            />
          )}
        </MapContainer>
      </div>
      <p className="text-xs text-slate-500">
        {value
          ? `Selected ${value.lat.toFixed(5)}, ${value.lng.toFixed(5)}. Owner-entered, not verified.`
          : 'No pin. The listing stays findable in list view by locality and address.'}
      </p>
    </div>
  );
}
