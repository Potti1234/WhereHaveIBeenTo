'use client'

import { Node, mergeAttributes } from '@tiptap/core'
import {
  ReactNodeViewRenderer,
  NodeViewWrapper,
  NodeViewProps
} from '@tiptap/react'
import { Globe, XIcon } from 'lucide-react'
import MapComponent, { type Location, type Route } from '../map-component'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

// Geocoding API mock - in a real app, you would use a real geocoding service
const geocodeLocation = async (
  locationName: string
): Promise<[number, number] | null> => {
  // This is a mock function that returns coordinates for some predefined cities
  const cities: Record<string, [number, number]> = {
    tokyo: [35.6762, 139.6503],
    osaka: [34.6937, 135.5023],
    kyoto: [35.0116, 135.7681],
    sapporo: [43.0618, 141.3545],
    hiroshima: [34.3853, 132.4553],
    fukuoka: [33.5904, 130.4017],
    nagoya: [35.1815, 136.9066],
    nara: [34.6851, 135.8048],
    kobe: [34.6901, 135.1955],
    yokohama: [35.4437, 139.638],
    'new york': [40.7128, -74.006],
    'los angeles': [34.0522, -118.2437],
    london: [51.5074, -0.1278],
    paris: [48.8566, 2.3522],
    rome: [41.9028, 12.4964],
    sydney: [-33.8688, 151.2093],
    beijing: [39.9042, 116.4074],
    seoul: [37.5665, 126.978],
    bangkok: [13.7563, 100.5018],
    singapore: [1.3521, 103.8198]
  }

  const normalizedName = locationName.toLowerCase().trim()

  // Check if the location name contains any of our predefined cities
  for (const [city, coords] of Object.entries(cities)) {
    if (normalizedName.includes(city)) {
      return coords
    }
  }

  return null
}

const MapNodeComponent = ({ editor, deleteNode }: NodeViewProps) => {
  const [locations, setLocations] = useState<Location[]>([])
  const [routes, setRoutes] = useState<Route[]>([])

  // Extract locations and routes from the editor content
  useEffect(() => {
    if (!editor) return

    const extractLocations = async () => {
      const newLocations: Location[] = []
      const newRoutes: Route[] = []
      const locationMap: Record<string, Location> = {}

      // Process the document to find hotels, activities, and flights
      const json = editor.getJSON()

      // Function to process nodes recursively
      const processNodes = async (nodes: any[]) => {
        if (!nodes) return

        for (const node of nodes) {
          // Process hotels
          if (node.type === 'hotelBlock') {
            const locationName = node.attrs.location || ''
            if (locationName) {
              const coords = await geocodeLocation(locationName)
              if (coords) {
                const id = `hotel-${newLocations.length}`
                const location: Location = {
                  id,
                  name: locationName,
                  type: 'hotel',
                  lat: coords[0],
                  lng: coords[1],
                  details: {
                    hotelName: node.attrs.name,
                    price: node.attrs.price
                  }
                }
                newLocations.push(location)
                locationMap[locationName.toLowerCase()] = location
              }
            }
          }

          // Process activities
          if (node.type === 'activityBlock') {
            const locationName = node.attrs.location || ''
            if (locationName) {
              const coords = await geocodeLocation(locationName)
              if (coords) {
                const id = `activity-${newLocations.length}`
                const location: Location = {
                  id,
                  name: locationName,
                  type: 'activity',
                  lat: coords[0],
                  lng: coords[1],
                  details: {
                    activityName: node.attrs.name,
                    price: node.attrs.price
                  }
                }
                newLocations.push(location)
                locationMap[locationName.toLowerCase()] = location
              }
            }
          }

          // Process flights
          if (node.type === 'flightBlock') {
            const departure = node.attrs.departure || ''
            const arrival = node.attrs.arrival || ''

            // Add airports if they don't exist
            if (departure && !locationMap[departure.toLowerCase()]) {
              const coords = await geocodeLocation(departure)
              if (coords) {
                const id = `airport-${newLocations.length}`
                const location: Location = {
                  id,
                  name: departure,
                  type: 'airport',
                  lat: coords[0],
                  lng: coords[1]
                }
                newLocations.push(location)
                locationMap[departure.toLowerCase()] = location
              }
            }

            if (arrival && !locationMap[arrival.toLowerCase()]) {
              const coords = await geocodeLocation(arrival)
              if (coords) {
                const id = `airport-${newLocations.length}`
                const location: Location = {
                  id,
                  name: arrival,
                  type: 'airport',
                  lat: coords[0],
                  lng: coords[1]
                }
                newLocations.push(location)
                locationMap[arrival.toLowerCase()] = location
              }
            }

            // Create route between departure and arrival
            if (departure && arrival) {
              const fromLocation = locationMap[departure.toLowerCase()]
              const toLocation = locationMap[arrival.toLowerCase()]

              if (fromLocation && toLocation) {
                const route: Route = {
                  id: `flight-${newRoutes.length}`,
                  from: fromLocation.id,
                  to: toLocation.id,
                  type: 'flight',
                  details: {
                    airline: node.attrs.airline,
                    flightNumber: node.attrs.flightNumber
                  }
                }
                newRoutes.push(route)
              }
            }
          }

          // Process child nodes
          if (node.content) {
            await processNodes(node.content)
          }
        }
      }

      if (json.content) {
        await processNodes(json.content)
      }

      setLocations(newLocations)
      setRoutes(newRoutes)
    }

    extractLocations()

    // Set up a listener for document changes
    const updateHandler = () => {
      extractLocations()
    }

    editor.on('update', updateHandler)

    return () => {
      editor.off('update', updateHandler)
    }
  }, [editor])

  return (
    <NodeViewWrapper>
      <Card className='my-4 overflow-hidden'>
        <CardHeader className='flex flex-row items-center justify-between p-2 py-3 bg-muted/50 border-b'>
          <div className='flex items-center gap-2'>
            <Globe className='h-5 w-5 text-primary' />
            {/* <CardTitle className='text-lg'>Trip Map</CardTitle> */}
          </div>
          <Button variant='ghost' size='icon' onClick={deleteNode}>
            <XIcon className='h-4 w-4' />
          </Button>
        </CardHeader>

        <CardContent className='p-0'>
          <MapComponent locations={locations} routes={routes} height='400px' />
        </CardContent>

        <CardFooter className='p-2 py-3 bg-muted/50 border-t text-xs text-muted-foreground'>
          {locations.length === 0
            ? 'Add hotels, activities, and flights to see them on the map'
            : `Showing ${locations.length} locations and ${routes.length} routes`}
        </CardFooter>
      </Card>
    </NodeViewWrapper>
  )
}

export default Node.create({
  name: 'mapBlock',
  group: 'block',
  atom: true,

  addAttributes () {
    return {
      id: { default: null }
    }
  },

  parseHTML () {
    return [
      {
        tag: 'div[data-type="map-block"]'
      }
    ]
  },

  renderHTML ({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, { 'data-type': 'map-block' })
    ]
  },

  addNodeView () {
    return ReactNodeViewRenderer(MapNodeComponent)
  }
})
