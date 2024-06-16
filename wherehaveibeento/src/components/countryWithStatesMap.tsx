"use client"

import { MapContainer, TileLayer, GeoJSON} from 'react-leaflet'
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import React from 'react';
import { createClient } from '@/utils/supabase/client';
import { Country } from '@/types/customn';

export default function CountryWithStatesMap(props: { country: Country | null}) {
  const supabase = createClient()
  const [geoJson, setGeoJson] = React.useState<any>(null);

  const getCountryGeoJson = () => {
    if(!props.country) {
        return;
    }
    supabase.storage.from('GeoJson').download(`WithStates/${props.country.iso2?.toLowerCase()}.geojson`).then((value) => {
       if (value.error) {
            return;
       }

       value.data.text().then((text) => {
            setGeoJson(JSON.parse(text))
       })
    })
  }

  React.useEffect(() => {
      getCountryGeoJson()
  }, [])

  const onEachState = (country : any, layer: any) => {
    const countryName = country.properties.name;
    layer.bindPopup(countryName);
  };

  return (
    <div >
        <MapContainer
            center={props.country && props.country.latitude && props.country.longitude ? [props.country.latitude, props.country.longitude] : [30, 10]}
            zoomControl={false}
            maxZoom={15}
            minZoom={3}
            zoom={4}
            zoomSnap={0.5}
            zoomDelta={0.5}
            wheelPxPerZoomLevel={120}
            maxBoundsViscosity={0.5}
            maxBounds={L.latLngBounds(new L.LatLng(-90, -180), new L.LatLng(90, 180))}
            style={{ height: "50svh", width: "100%" }}
            >
            {geoJson && <GeoJSON data={geoJson} onEachFeature={onEachState} />}
            
            <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
        </MapContainer>
    </div>
  );
}