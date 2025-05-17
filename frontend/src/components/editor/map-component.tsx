"use client"

import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import { Icon } from "leaflet"
import { Hotel, Plane, MapPin } from "lucide-react"

// Fix for default marker icons in Leaflet with Next.js
const defaultIcon = new Icon({
  iconUrl: "/marker-icon.png",
  iconRetinaUrl: "/marker-icon-2x.png",
  shadowUrl: "/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

// Custom icons for different types of locations
const hotelIcon = defaultIcon
const activityIcon = defaultIcon
const airportIcon = defaultIcon

export type Location = {
  id: string
  name: string
  type: "hotel" | "activity" | "airport"
  lat: number
  lng: number
  details?: any
}

export type Route = {
  id: string
  from: string // location id
  to: string // location id
  type: "flight"
  details?: any
}

interface MapComponentProps {
  locations: Location[]
  routes: Route[]
  height?: string
}

export default function MapComponent({ locations, routes, height = "400px" }: MapComponentProps) {
  const [mapLocations, setMapLocations] = useState<Location[]>([])
  const [mapRoutes, setMapRoutes] = useState<any[]>([])

  useEffect(() => {
    setMapLocations(locations)

    // Process routes to create polylines
    const processedRoutes = routes
      .map((route) => {
        const fromLocation = locations.find((loc) => loc.id === route.from)
        const toLocation = locations.find((loc) => loc.id === route.to)

        if (fromLocation && toLocation) {
          return {
            id: route.id,
            positions: [
              [fromLocation.lat, fromLocation.lng],
              [toLocation.lat, toLocation.lng],
            ],
            type: route.type,
            details: route.details,
          }
        }
        return null
      })
      .filter(Boolean)

    setMapRoutes(processedRoutes)
  }, [locations, routes])

  // Find center of the map based on locations
  const getMapCenter = () => {
    if (locations.length === 0) {
      return [35.6762, 139.6503] // Default: Tokyo
    }

    const lats = locations.map((loc) => loc.lat)
    const lngs = locations.map((loc) => loc.lng)

    const centerLat = lats.reduce((sum, lat) => sum + lat, 0) / lats.length
    const centerLng = lngs.reduce((sum, lng) => sum + lng, 0) / lngs.length

    return [centerLat, centerLng]
  }

  // Get appropriate zoom level
  const getZoomLevel = () => {
    if (locations.length <= 1) return 10
    if (locations.length <= 3) return 7
    return 5
  }

  // Get icon based on location type
  const getIcon = (type: string) => {
    switch (type) {
      case "hotel":
        return hotelIcon
      case "activity":
        return activityIcon
      case "airport":
        return airportIcon
      default:
        return defaultIcon
    }
  }

  // Get marker icon component based on location type
  const getMarkerIcon = (type: string) => {
    switch (type) {
      case "hotel":
        return <Hotel className="text-blue-600" size={16} />
      case "activity":
        return <MapPin className="text-green-600" size={16} />
      case "airport":
        return <Plane className="text-red-600" size={16} />
      default:
        return <MapPin className="text-gray-600" size={16} />
    }
  }

  if (typeof window === "undefined") {
    return (
      <div style={{ height, width: "100%" }} className="bg-gray-100 flex items-center justify-center">
        <p>Map loading...</p>
      </div>
    )
  }

  return (
    <div style={{ height, width: "100%" }}>
      {mapLocations.length > 0 && (
        <MapContainer
          center={getMapCenter() as [number, number]}
          zoom={getZoomLevel()}
          style={{ height: "100%", width: "100%", borderRadius: "0.5rem" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {mapLocations.map((location) => (
            <Marker key={location.id} position={[location.lat, location.lng]} icon={getIcon(location.type)}>
              <Popup>
                <div className="flex items-center gap-1 font-medium">
                  {getMarkerIcon(location.type)}
                  {location.name}
                </div>
                {location.details && (
                  <div className="text-sm text-gray-600 mt-1">
                    {location.type === "hotel" && location.details.price && <div>{location.details.price}</div>}
                  </div>
                )}
              </Popup>
            </Marker>
          ))}

          {mapRoutes.map((route) => (
            <Polyline
              key={route.id}
              positions={route.positions}
              color={route.type === "flight" ? "#3b82f6" : "#6b7280"}
              weight={2}
              dashArray={route.type === "flight" ? "5, 5" : ""}
            />
          ))}
        </MapContainer>
      )}
    </div>
  )
}
