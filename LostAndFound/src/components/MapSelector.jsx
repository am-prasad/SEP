import React, { useState } from 'react';
import { Map, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { campusLocations } from '@/data/mockData';

const MapSelector = ({ onLocationSelect }) => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  
  // Simulate clicking on map to select a location
  const handleMapClick = (lat, lng) => {
    const newLocation = {
      lat, 
      lng,
      description: 'Custom location'
    };
    
    setSelectedLocation(newLocation);
    onLocationSelect(newLocation);
    toast.info("Location selected", {
      description: `Coordinates: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
    });
  };
  
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
      
      {/* Mock map - in a real app we would use Leaflet or Google Maps */}
      <div className="flex-1 bg-muted relative">
        <div className="absolute inset-0 flex items-center justify-center flex-col gap-4">
          <Map className="h-12 w-12 text-primary opacity-20" />
          <div className="text-center px-4">
            <p className="font-medium">Map Placeholder</p>
            <p className="text-sm text-muted-foreground">
              In a real application, this would be an interactive map for selecting locations
            </p>
          </div>
          <Button onClick={() => handleMapClick(40.1062, -88.2272)}>
            Simulate Location Selection
          </Button>
        </div>
        
        {/* Display marker for selected location */}
        {selectedLocation && (
          <div className="absolute bottom-4 left-4 bg-background p-2 rounded-md shadow text-xs">
            Location selected: {selectedLocation.description || 'Custom location'}
          </div>
        )}
      </div>
    </div>
  );
};

export default MapSelector;
