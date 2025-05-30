import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { campusLocations } from '@/data/mockData';

// Fix default marker icon issue with Leaflet + Webpack/React
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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
        description: `Coordinates: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
      });
    },
  });

  return null;
};

const MapSelector = ({ onLocationSelect }) => {
  const [selectedLocation, setSelectedLocation] = useState(null);

  // Select a predefined campus location
  const selectCampusLocation = (location) => {
    setSelectedLocation(location);
    onLocationSelect(location);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-2 border-b">
        <div className="flex flex-wrap gap-2">
          {campusLocations.map((location, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => selectCampusLocation(location)}
            >
              {location.description}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex-1 relative">
        <MapContainer
          center={[40.1062, -88.2272]} // Default center
          zoom={15}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Allow user to click on map to select location */}
          <LocationSelector
            onLocationSelect={(loc) => {
              setSelectedLocation(loc);
              onLocationSelect(loc);
            }}
          />

          {/* Show marker for selected location */}
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
