'use client'

import { MapContainer, Marker, Popup, TileLayer, GeoJSON } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import React from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useNavigate } from '@tanstack/react-router'
import { MapScopeSelector } from '@/components/map/MapScopeSelector'
import { useVisitedCity } from '@/hooks/use-visited-city'
import { useGeoJson } from '@/hooks/use-geo-json'
import { useCountry } from '@/hooks/use-country'

interface WorldMapProps {
  userId: string | null
}

export default function WorldMap ({ userId }: WorldMapProps) {
  const navigate = useNavigate()
  const [scope, setScope] = React.useState<string>('cities')

  // Use existing hooks
  const { visitedCities, removeVisitedCity } = useVisitedCity(userId ?? '')
  const { worldGeoJson } = useGeoJson()
  const { countries } = useCountry()

  // Calculate visited countries from visited cities
  const visitedCountries = React.useMemo(() => {
    const newCountries: Map<string, string> = new Map()
    visitedCities.forEach(city => {
      if (
        city.expand?.city.expand.country.iso2 &&
        city.expand?.city.expand.country.id
      ) {
        newCountries.set(
          city.expand?.city.expand.country.iso2,
          city.expand?.city.expand.country.id
        )
      }
    })
    return newCountries
  }, [visitedCities])

  const countriesMap = React.useMemo(() => {
    const map = new Map<string, string>()
    countries.forEach(country => {
      if (country.iso2 && country.id) {
        map.set(country.iso2, country.id)
      }
    })
    return map
  }, [countries])

  const icon = L.icon({
    iconUrl: '/images/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
  })

  const handleRemoveCity = (visitedCityId: string) => {
    if (!userId) return
    removeVisitedCity(visitedCityId)
  }

  const onEachCountry = (country: GeoJSON.Feature, layer: L.Path) => {
    const countryName = country.properties?.ADMIN || 'Unknown'
    const countryIso2 = country.properties?.ISO_A2 || 'Unknown'
    const countryId = countriesMap.get(countryIso2)
    layer.bindPopup(
      countryName +
        '<br>' +
        "<a href='/explore/country/" +
        countryId +
        "'>View Information</a>"
    )

    layer.options.fillColor = visitedCountries.get(countryIso2)
      ? 'green'
      : 'red'
  }

  return (
    <div>
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
        maxBounds={L.latLngBounds(
          new L.LatLng(-90, -180),
          new L.LatLng(90, 180)
        )}
        style={{ height: '100svh', width: '100%' }}
      >
        {visitedCities.length > 0 &&
          scope === 'cities' &&
          visitedCities.map((visitedCity, index) => {
            if (
              !visitedCity.expand?.city.latitude ||
              !visitedCity.expand?.city.longitude
            )
              return null
            return (
              <Marker
                position={[
                  visitedCity.expand.city.latitude,
                  visitedCity.expand.city.longitude
                ]}
                key={index}
                icon={icon}
              >
                <Popup>
                  <Label>{visitedCity.expand.city.name}</Label>
                  <img
                    src={`https://purecatamphetamine.github.io/country-flag-icons/3x2/${visitedCity.expand?.city.expand.country.iso2}.svg`}
                    alt='Flag'
                    className='mr-2 h-16 w-16'
                  />
                  <Button
                    onClick={() => handleRemoveCity(visitedCity.id ?? '')}
                  >
                    Delete
                  </Button>
                  <Button
                    onClick={() =>
                      navigate({
                        to: `/explore/city/${visitedCity.expand?.city.id}`
                      })
                    }
                  >
                    View Information
                  </Button>
                </Popup>
              </Marker>
            )
          })}

        {worldGeoJson && scope === 'countries' && (
          <GeoJSON data={worldGeoJson.json} onEachFeature={onEachCountry} />
        )}
        <MapScopeSelector scopeCallback={setScope} />

        <TileLayer
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
      </MapContainer>
    </div>
  )
}
