import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default marker icon issue in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.3/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.3/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.3/images/marker-shadow.png',
});

const containerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '0.5rem',
};

const MapPreview = ({ lat, lng }) => {
  return (
    <div style={containerStyle}>
      <MapContainer center={[lat, lng]} zoom={16} style={{ height: '100%', borderRadius: '0.5rem' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={[lat, lng]}>
          <Popup>
            Location: {lat}, {lng}
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default MapPreview;
