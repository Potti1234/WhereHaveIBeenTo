"use client"

import { MapContainer, TileLayer} from 'react-leaflet'
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function Map() {
  return (
    <div>
        <MapContainer
            center={[51.505, -0.09]}
            zoom={13}
            scrollWheelZoom={true}
            style={{ height: "100vh", width: "100%" }}
        >
            <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
        </MapContainer>
    </div>
  );
}