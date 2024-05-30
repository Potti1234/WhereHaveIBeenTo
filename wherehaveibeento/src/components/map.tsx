"use client"

import { MapContainer, TileLayer} from 'react-leaflet'
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function Map() {
  return (
    <div >
        <MapContainer
            center={[30, 0]}
            zoomControl={false}
            maxZoom={15}
            minZoom={3}
            zoom={3}
            zoomSnap={0.5}
            zoomDelta={0.5}
            wheelPxPerZoomLevel={120}
            maxBoundsViscosity={0.5}
            maxBounds={L.latLngBounds(new L.LatLng(-90, -180), new L.LatLng(90, 180))}
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