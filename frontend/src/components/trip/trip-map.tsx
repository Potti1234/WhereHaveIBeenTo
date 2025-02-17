'use client'

import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  Polyline,
  useMap
} from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import React from 'react'
import { Label } from '@/components/ui/label'
import type { TravelItemType } from '@/schemas/trip-schema'
import type { ExpandedTripType } from '@/schemas/trip-schema'

interface Coordinate {
  from: [number, number]
  to: [number, number]
  type: TravelItemType['type']
  startDate: string | null
  arrivalDate: string | null
}

interface TripMapProps {
  trip: ExpandedTripType
}

// This component handles map updates without reinitializing
function MapUpdater ({ center }: { center: [number, number] }) {
  const map = useMap()

  React.useEffect(() => {
    map.setView(center, map.getZoom())
  }, [map, center])

  return null
}

export default function TripMap ({ trip }: TripMapProps) {
  const icon = React.useMemo(
    () =>
      L.icon({
        iconUrl: '/images/marker-icon.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41]
      }),
    []
  )

  // Create an array of coordinates for the polyline
  const coordinates = React.useMemo(() => {
    if (!trip.expand?.travel_items) return []

    return trip.expand.travel_items
      .map(item => {
        if (!item.expand) return null
        const from = item.expand.from
        const to = item.expand.to

        if (!from || !to) return null

        return {
          from: [from.latitude, from.longitude] as [number, number],
          to: [to.latitude, to.longitude] as [number, number],
          type: item.type,
          startDate: item.start_date,
          arrivalDate: item.arrival_date
        }
      })
      .filter((coord): coord is Coordinate => coord !== null)
  }, [trip])

  // Calculate center of the map based on all coordinates
  const center = React.useMemo(() => {
    if (coordinates.length === 0) return [30, 0] as [number, number]

    const lats = coordinates.flatMap(coord => [coord.from[0], coord.to[0]])
    const lngs = coordinates.flatMap(coord => [coord.from[1], coord.to[1]])

    const avgLat = lats.reduce((a, b) => a + b, 0) / lats.length
    const avgLng = lngs.reduce((a, b) => a + b, 0) / lngs.length

    return [avgLat, avgLng] as [number, number]
  }, [coordinates])

  return (
    <div className='relative h-[50vh]'>
      <MapContainer
        key={new Date().getTime()}
        center={center}
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
        style={{ height: '100%', width: '100%' }}
      >
        <MapUpdater center={center} />

        {coordinates.map((coord, index) => (
          <React.Fragment key={`${trip.id}-route-${index}`}>
            {/* From marker */}
            <Marker position={coord.from} icon={icon}>
              <Popup>
                <Label>
                  {trip.expand?.travel_items[index].expand?.from.name}
                </Label>
                <div>Departure: {coord.startDate}</div>
              </Popup>
            </Marker>

            {/* To marker */}
            <Marker position={coord.to} icon={icon}>
              <Popup>
                <Label>
                  {trip.expand?.travel_items[index].expand?.to.name}
                </Label>
                <div>Arrival: {coord.arrivalDate}</div>
              </Popup>
            </Marker>

            {/* Line connecting the points with arrow */}
            <Polyline
              positions={[coord.from, coord.to]}
              pathOptions={{
                color: getTransportColor(coord.type),
                weight: 3
              }}
            />
          </React.Fragment>
        ))}

        <TileLayer
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
      </MapContainer>
    </div>
  )
}

function getTransportColor (type: string): string {
  switch (type) {
    case 'plane':
      return '#3b82f6' // blue
    case 'train':
      return '#10b981' // green
    case 'bus':
      return '#f59e0b' // yellow
    case 'car':
      return '#ef4444' // red
    default:
      return '#6b7280' // gray
  }
}
