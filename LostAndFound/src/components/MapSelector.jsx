import React, { useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents
} from 'react-leaflet';
import L from 'leaflet';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { campusLocations } from '@/data/mockData';

// Fix default marker icon issue with Webpack/Vite and Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component for listening to map click events
const LocationSelector = ({ onLocationSelect }) => {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      const newLocation = {
        lat,
        lng,
        description: 'Custom location',
      };
      onLocationSelect(newLocation);
      toast.info('Location selected', {
        description: `Coordinates: ${lat.toFixed(6)}, ${lng.toFixed(6)}`
      });
    }
  });
  return null;
};

// Main MapSelector component
const MapSelector = ({ onLocationSelect }) => {
  const [selectedLocation, setSelectedLocation] = useState(null);

  const handleSelect = (location) => {
    setSelectedLocation(location);
    onLocationSelect(location);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-2 border-b bg-muted">
        <div className="flex flex-wrap gap-2">
          {campusLocations.map((location, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => handleSelect(location)}
            >
              {location.description}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex-1 relative">
        <MapContainer
          center={[12.31330021942581, 76.61337063084042]} // Default center (UIUC example)
          zoom={16}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <LocationSelector onLocationSelect={handleSelect} />

          {selectedLocation && (
            <Marker position={[selectedLocation.lat, selectedLocation.lng]}>
              <Popup>{selectedLocation.description}</Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
    </div>
  );
};

export default MapSelector;
