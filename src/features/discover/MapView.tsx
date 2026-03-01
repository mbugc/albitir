import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Offer } from '@/types';
import { formatCurrency } from '@/utils/formatCurrency';

// Fix default marker icon issue with bundlers
const activeIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface MapViewProps {
  offers: Offer[];
  center: [number, number];
}

export default function MapView({ offers, center }: MapViewProps) {
  const navigate = useNavigate();

  return (
    <MapContainer
      center={center}
      zoom={13}
      className="h-full w-full"
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {offers.map((offer) => (
        <Marker
          key={offer.id}
          position={[offer.geo.latitude, offer.geo.longitude]}
          icon={activeIcon}
        >
          <Popup>
            <button
              onClick={() => navigate(`/offers/${offer.id}`)}
              className="block text-left"
            >
              <p className="font-semibold text-slate-900">{offer.title}</p>
              <p className="text-xs text-slate-500">{offer.businessName}</p>
              <p className="mt-1 text-sm font-bold text-primary-700">
                {formatCurrency(offer.priceDiscounted)}
                <span className="ml-1 text-xs font-normal text-slate-400 line-through">
                  {formatCurrency(offer.priceOriginal)}
                </span>
              </p>
              <p className="mt-1 text-xs text-primary-600">Detayları gör →</p>
            </button>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
