import React from 'react';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';

const containerStyle = {
width: '100%',
height: '100%',
borderRadius: '0.5rem',
};

const MapPreview = ({ lat, lng }) => {
const { isLoaded } = useLoadScript({
googleMapsApiKey: 'AIzaSyBxWIWCGfP12Y0DKWq2adEXybF8fQgJ2JQ', // Replace with your actual key
});

if (!isLoaded) return <div>Loading Map...</div>;

return (
<GoogleMap
mapContainerStyle={containerStyle}
center={{ lat, lng }}
zoom={16}
>
<Marker position={{ lat, lng }} />
</GoogleMap>
);
};

export default MapPreview;