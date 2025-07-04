import React, { useState, useEffect } from 'react';
import { useItems } from '@/context/ItemsContext';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin } from 'lucide-react';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix Leaflet's default icon issue
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

// Helper component to update map view on center or zoom change
function ChangeView({ center, zoom }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

const campusCenter = { lat: 12.31330021942581, lng: 76.61337063084042, zoom: 17 };

const MapView = () => {
  const { items, loading } = useItems();

  const [filteredItems, setFilteredItems] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const [mapCenter, setMapCenter] = useState(campusCenter);

  useEffect(() => {
    if (loading) return;

    let filtered = [...items];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter);
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }

    setFilteredItems(filtered);
  }, [items, statusFilter, categoryFilter, loading]);

  const handleItemClick = (item) => {
    setSelectedItem(item);
    if (item.location && item.location.lat && item.location.lng) {
      setMapCenter({
        lat: item.location.lat,
        lng: item.location.lng,
        zoom: 18,
      });
    }
  };

  const handleMarkerClick = (item) => {
    setSelectedItem(item);
  };

  return (
    <div className="flex flex-col items-center justify-center text-center min-h-screen px-4 mx-auto max-w-full">
      <div className="mx-auto py-6 max-w-7xl w-full">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Campus Map</h1>
          <p className="text-muted-foreground">
            See where items have been lost and found across campus
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 pb-20 sm:pb-6">
          {/* Map Filters */}
          <div className="w-full lg:w-72 flex-shrink-0 order-2 lg:order-1">
            <div className="sticky top-20">
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-3">Filters</h3>

                  <div className="mb-4">
                    <label className="text-sm font-medium mb-1 block">Status</label>
                    <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Items</SelectItem>
                        <SelectItem value="lost">Lost Items</SelectItem>
                        <SelectItem value="found">Found Items</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="mb-4">
                    <label className="text-sm font-medium mb-1 block">Category</label>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="electronics">Electronics</SelectItem>
                        <SelectItem value="clothing">Clothing</SelectItem>
                        <SelectItem value="accessories">Accessories</SelectItem>
                        <SelectItem value="documents">Documents</SelectItem>
                        <SelectItem value="keys">Keys</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-4">
                <CardContent className="p-4">
                  <h3 className="font-medium mb-3">Items ({filteredItems.length})</h3>

                  {loading ? (
                    <p>Loading items...</p>
                  ) : filteredItems.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No items match current filters</p>
                  ) : (
                    <ScrollArea className="h-72">
                      <div className="space-y-3">
                        {filteredItems.map((item, index) => (
                          <div
                            key={item.id ?? index}
                            className={`p-3 rounded-md cursor-pointer transition-colors text-sm ${
                              selectedItem?.id === item.id
                                ? 'bg-primary text-primary-foreground'
                                : 'hover:bg-accent'
                            }`}
                            onClick={() => handleItemClick(item)}
                          >
                            <div className="font-medium">{item.title}</div>
                            <div className="flex items-center gap-1 mt-1">
                              <MapPin className="h-3 w-3" />
                              <span className="truncate">{item.location?.description || 'Custom location'}</span>
                            </div>
                            <div className="mt-1">
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full ${
                                  item.status === 'lost'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-green-100 text-green-800'
                                }`}
                              >
                                {item.status === 'lost' ? 'Lost' : 'Found'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Map Container */}
          <div className="w-full lg:w-[800px] h-[75vh] bg-gray-100 rounded-lg overflow-hidden order-1 lg:order-2 relative">
            <MapContainer
              center={[mapCenter.lat, mapCenter.lng]}
              zoom={mapCenter.zoom || 15}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={true}
            >
              <ChangeView center={[mapCenter.lat, mapCenter.lng]} zoom={mapCenter.zoom || 15} />
              <TileLayer
                attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {filteredItems.map((item, index) =>
                item.location && item.location.lat && item.location.lng ? (
                  <Marker
                    key={item.id ?? index}
                    position={[item.location.lat, item.location.lng]}
                    eventHandlers={{
                      click: () => handleMarkerClick(item),
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
                ) : null
              )}
            </MapContainer>

            {selectedItem && (
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <Card className="shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{selectedItem.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              selectedItem.status === 'lost'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {selectedItem.status === 'lost' ? 'Lost' : 'Found'}
                          </span>
                          <span>at {selectedItem.location?.description || 'Custom location'}</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedItem(null)}>
                        ✕
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;
