import React from 'react';
import { MapPin, Map } from 'lucide-react';

const CampusMap = ({ items, center, onMarkerClick, selectedItem }) => {
  const handleMarkerClick = (item) => {
    if (onMarkerClick) {
      onMarkerClick(item);
    }
  };

  return (
    <div className="h-full relative bg-muted">
      <div className="absolute inset-0 flex items-center justify-center flex-col gap-4">
        <Map className="h-16 w-16 text-primary opacity-20" />
        <div className="text-center px-4">
          <p className="font-medium">Map Placeholder</p>
          <p className="text-sm text-muted-foreground">
            In a real application, this would be an interactive map for showing item locations
          </p>
        </div>
      </div>

      {/* Simulate map markers */}
      <div className="absolute inset-0">
        {items.map((item) => (
          <button
            key={item.id}
            className={`absolute p-1 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer ${
              item.id === selectedItem?.id ? 'z-10' : ''
            }`}
            style={{
              // Randomize positions for demo
              left: `${(item.location.lat * 10) % 90 + 5}%`,
              top: `${(item.location.lng * 10) % 80 + 10}%`,
            }}
            onClick={() => handleMarkerClick(item)}
          >
            <div className="flex flex-col items-center">
              <MapPin
                className={`h-6 w-6 ${
                  item.status === 'lost' ? 'text-red-500' : 'text-green-500'
                } ${item.id === selectedItem?.id ? 'text-primary' : ''}`}
                fill={item.id === selectedItem?.id ? 'currentColor' : 'none'}
              />
              {item.id === selectedItem?.id && (
                <div className="mt-1 px-2 py-1 bg-background text-foreground text-xs rounded shadow whitespace-nowrap">
                  {item.title}
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CampusMap;
