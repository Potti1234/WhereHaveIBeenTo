'use client'

import { MapContainer, Marker, Popup, TileLayer, GeoJSON } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import React from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from './ui/button'
import { Label } from '@radix-ui/react-dropdown-menu'
import { useRouter } from 'next/navigation'
import { MapScopeSelector } from './MapScopeSelector'

export default function WorldMap (props: { user_id: string | null }) {
  const supabase = createClient()
  const [cities, setCities] = React.useState<any[]>([])
  const [user_id, setUserId] = React.useState<string>('')
  const [geoJson, setGeoJson] = React.useState<any>(null)
  const [visitedCountries, setVisitedCountries] = React.useState<
    Map<string, string>
  >(new Map<string, string>())
  const [countries, setCountries] = React.useState<Map<string, string>>(
    new Map<string, string>()
  )
  const [scope, setScope] = React.useState<string>('cities')
  const router = useRouter()

  const icon = L.icon({
    iconUrl: '/images/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
  })

  const fetchVisitedCities = async (user_id: string) => {
    const { data, error } = await supabase
      .from('visited_city')
      .select(`city ( name, id, latitude, longitude, country (iso2, id))`)
      .eq('user_id', user_id)

    if (error) {
      console.error(error)
    } else {
      setCities(data)
      const newCountries: Map<string, string> = new Map()
      data.forEach((city: any) => {
        newCountries.set(city.city.country.iso2, city.city.country.id)
      })
      setVisitedCountries(newCountries)
    }
  }

  const deleteVisitedCity = async (city_id: string) => {
    const { error } = await supabase
      .from('visited_city')
      .delete()
      .eq('city_id', city_id)
      .eq('user_id', user_id)

    if (error) {
      console.error(error)
    } else {
      fetchVisitedCities(user_id)
    }
  }

  const getCountryGeoJson = () => {
    supabase.storage
      .from('GeoJson')
      .download(`world.geojson`)
      .then(value => {
        if (value.error) {
          return
        }

        value.data.text().then(text => {
          setGeoJson(JSON.parse(text))
        })
      })
  }

  const fetchCountries = async () => {
    const { data, error } = await supabase.from('country').select(`iso2, id`)

    if (error) {
      console.error(error)
    } else {
      const newCountries: Map<string, string> = new Map()
      data.forEach((country: any) => {
        newCountries.set(country.iso2, country.id)
      })
      setCountries(newCountries)
    }
  }

  React.useEffect(() => {
    fetchCountries()
    getCountryGeoJson()
    if (props.user_id) {
      fetchVisitedCities(props.user_id)
      setUserId(props.user_id)
      return
    }

    supabase.auth.getUser().then(({ data, error }) => {
      if (error) {
        console.error('Error getting user', error)
        return
      }
      fetchVisitedCities(data.user.id)
      setUserId(data.user.id)
    })
  }, [])

  const onEachCountry = (country: any, layer: any) => {
    const countryName = country.properties.ADMIN
    const countryIso2 = country.properties.ISO_A2
    const countryId = countries.get(countryIso2)
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
        {cities.length > 0 &&
          scope === 'cities' &&
          cities.map((city, index) => {
            return (
              <Marker
                position={[city.city.latitude, city.city.longitude]}
                key={index}
                icon={icon}
              >
                <Popup>
                  <Label>{city.city.name}</Label>
                  <img
                    src={`https://purecatamphetamine.github.io/country-flag-icons/3x2/${city.city.country.iso2}.svg`}
                    alt='Flag'
                    className='mr-2 h-16 w-16'
                  />
                  <Button onClick={() => deleteVisitedCity(city.city.id)}>
                    Delete
                  </Button>
                  <Button
                    onClick={() => router.push(`/explore/city/${city.city.id}`)}
                  >
                    View Information
                  </Button>
                </Popup>
              </Marker>
            )
          })}

        {geoJson && scope === 'countries' && (
          <GeoJSON data={geoJson} onEachFeature={onEachCountry} />
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
