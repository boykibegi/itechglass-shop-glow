import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const storeIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const driverIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-gold.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const destinationIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface LocationPoint {
  lat: number;
  lng: number;
}

interface DeliveryMapProps {
  storeLocation: LocationPoint;
  driverLocation?: LocationPoint | null;
  destinationLocation?: LocationPoint | null;
  routeHistory?: LocationPoint[];
  className?: string;
}

// Component to update map view when driver moves
const MapUpdater = ({ driverLocation }: { driverLocation?: LocationPoint | null }) => {
  const map = useMap();
  const prevLocation = useRef<LocationPoint | null>(null);

  useEffect(() => {
    if (driverLocation && 
        (!prevLocation.current || 
         prevLocation.current.lat !== driverLocation.lat || 
         prevLocation.current.lng !== driverLocation.lng)) {
      map.panTo([driverLocation.lat, driverLocation.lng], { animate: true });
      prevLocation.current = driverLocation;
    }
  }, [driverLocation, map]);

  return null;
};

const DeliveryMap = ({
  storeLocation,
  driverLocation,
  destinationLocation,
  routeHistory = [],
  className = '',
}: DeliveryMapProps) => {
  const center = driverLocation 
    ? [driverLocation.lat, driverLocation.lng] 
    : [storeLocation.lat, storeLocation.lng];

  // Build route path from store -> route history -> current driver location
  const routePath: [number, number][] = [
    [storeLocation.lat, storeLocation.lng],
    ...routeHistory.map(point => [point.lat, point.lng] as [number, number]),
  ];

  if (driverLocation) {
    routePath.push([driverLocation.lat, driverLocation.lng]);
  }

  return (
    <div className={`rounded-lg overflow-hidden border border-border ${className}`}>
      <MapContainer
        center={center as [number, number]}
        zoom={14}
        style={{ height: '100%', width: '100%', minHeight: '400px' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapUpdater driverLocation={driverLocation} />

        {/* Store marker */}
        <Marker position={[storeLocation.lat, storeLocation.lng]} icon={storeIcon}>
          <Popup>
            <strong>iTech Glass Store</strong>
            <br />
            Pickup Location
          </Popup>
        </Marker>

        {/* Driver marker */}
        {driverLocation && (
          <Marker position={[driverLocation.lat, driverLocation.lng]} icon={driverIcon}>
            <Popup>
              <strong>Delivery Driver</strong>
              <br />
              On the way to you!
            </Popup>
          </Marker>
        )}

        {/* Destination marker */}
        {destinationLocation && (
          <Marker position={[destinationLocation.lat, destinationLocation.lng]} icon={destinationIcon}>
            <Popup>
              <strong>Delivery Destination</strong>
            </Popup>
          </Marker>
        )}

        {/* Route path */}
        {routePath.length > 1 && (
          <Polyline
            positions={routePath}
            pathOptions={{ 
              color: '#D4AF37', 
              weight: 4, 
              opacity: 0.8,
              dashArray: '10, 10'
            }}
          />
        )}
      </MapContainer>
    </div>
  );
};

export default DeliveryMap;
