import React from 'react';
import { GoogleMap, MarkerF, useJsApiLoader } from '@react-google-maps/api';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const defaultZoom = 16;

const CampusMap = ({ items, center, onMarkerClick, selectedItem }) => {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading map...</div>;

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={center}
      zoom={center.zoom || defaultZoom}
    >
      {items.map((item) => (
        <MarkerF
          key={item.id}
          position={{ lat: item.location.lat, lng: item.location.lng }}
          onClick={() => onMarkerClick(item)}
          label={{
            text: item.title,
            className: item.id === selectedItem?.id ? 'text-primary' : '',
            fontSize: '12px',
          }}
          icon={{
            url:
              item.status === 'lost'
                ? 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
                : 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
          }}
        />
      ))}
    </GoogleMap>
  );
};

export default CampusMap;
