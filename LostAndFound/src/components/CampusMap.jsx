import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix default icon issue with Leaflet + React
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Helper component to update map center
function ChangeView({ center, zoom }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

const CampusMap = ({ items, center, onMarkerClick, selectedItem }) => {
  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={center.zoom || 15}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={true}
    >
      <ChangeView center={[center.lat, center.lng]} zoom={center.zoom || 15} />
      <TileLayer
        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {items.map(item => (
        <Marker
          key={item.id}
          position={[item.location.lat, item.location.lng]}
          eventHandlers={{
            click: () => onMarkerClick(item),
          }}
        >
          <Popup>
            <div>
              <h3>{item.title}</h3>
              <p>Status: {item.status}</p>
              <p>Location: {item.location.description || 'Custom location'}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default CampusMap;
