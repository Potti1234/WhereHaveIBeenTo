"use client"

import { MapContainer, Marker, Popup, TileLayer} from 'react-leaflet'
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import React from 'react';
import { createClient } from '@/utils/supabase/client';

export const revalidate = 0

export default function Map() {
  const supabase = createClient()
  const [cities, setCities] = React.useState<(any[])>([]);

  const icon = L.icon({ iconUrl: "/images/marker-icon.png", iconSize: [25,41], iconAnchor: [12,41] });

  const fetchVisitedCities = async (user_id : string) => {
    const { data, error } = await supabase.from('visited_city')
    .select(`city ( name, id, latitude, longitude)`)
    .eq('user_id', user_id)

    console.log(data)
    if (error) {
      console.error(error)
    } else {
      setCities(data)
    }
  }

  React.useEffect(() => {
    supabase.auth.getUser().then(({ data, error }) => {
      if(error){
        console.error("Error getting user", error)
        return;
      }
      fetchVisitedCities(data.user.id)
    })

  }, [])


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
              {cities.length > 0 &&
                cities.map((city, index) => {
                  return (
                    <Marker position={[city.city.latitude, city.city.longitude]} key={index} icon={icon}>
                      <Popup>{city.city.name}</Popup>
                    </Marker>
                  );
     })}
            
            <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
        </MapContainer>
    </div>
  );
}