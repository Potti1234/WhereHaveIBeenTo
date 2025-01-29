'use client'

import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useGeoJson } from '@/hooks/use-geo-json'
import { Country } from '@/schemas/country-schema'

export default function CountryWithStatesMap (props: {
  country: Country | null
}) {
  const { withStatesGeoJson } = useGeoJson(props.country?.id)

  const onEachState = (country: any, layer: any) => {
    const countryName = country.properties.name
    layer.bindPopup(countryName)
  }

  return (
    <div>
      <MapContainer
        center={
          props.country && props.country.latitude && props.country.longitude
            ? [props.country.latitude, props.country.longitude]
            : [30, 10]
        }
        zoomControl={false}
        maxZoom={15}
        minZoom={3}
        zoom={4}
        zoomSnap={0.5}
        zoomDelta={0.5}
        wheelPxPerZoomLevel={120}
        maxBoundsViscosity={0.5}
        maxBounds={L.latLngBounds(
          new L.LatLng(-90, -180),
          new L.LatLng(90, 180)
        )}
        style={{ height: '50svh', width: '100%' }}
      >
        {withStatesGeoJson && (
          <GeoJSON data={withStatesGeoJson.json} onEachFeature={onEachState} />
        )}

        <TileLayer
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
      </MapContainer>
    </div>
  )
}
