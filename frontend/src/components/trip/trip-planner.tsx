import { useState } from 'react'
import { TripList } from '@/components/trip/trip-list'
import type { TravelItemType, ExpandedTripType } from '@/schemas/trip-schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { useTrip } from '@/hooks/use-trip'
import useAuth from '@/hooks/use-auth'
import { useEffect } from 'react'
import TripMap from './trip-map'

export default function TripPlanner (props: {
  trip: ExpandedTripType
  travelItems: TravelItemType[]
  edit: boolean
}) {
  const { user } = useAuth()
  const [trip, setTrip] = useState<ExpandedTripType>({
    name: '',
    description: '',
    user: user?.id,
    expand: {
      travel_items: []
    }
  })
  const [travelItems, setTravelItems] = useState<TravelItemType[]>([])

  const { createTrip, updateTrip } = useTrip()

  useEffect(() => {
    if (props.edit) {
      setTrip(props.trip)
      setTravelItems(props.travelItems)
    } else {
      const startTravelItem: TravelItemType = {
        type: 'bus',
        start_date: null,
        arrival_date: null,
        order: 0,
        from: '',
        to: ''
      }
      setTravelItems([startTravelItem])
    }
  }, [props.edit])

  const addCity = (index: number) => {
    const newItem: TravelItemType = {
      type: 'bus',
      start_date: null,
      arrival_date: null,
      order: index,
      from: travelItems[index - 1]?.to || '',
      to: ''
    }

    setTravelItems(prevItems => {
      const newItems = [...prevItems]
      newItems.splice(index, 0, newItem)
      return newItems.map((item, idx) => ({ ...item, order: idx }))
    })
  }

  const updateTravelItem = (id: string, updates: Partial<TravelItemType>) => {
    setTravelItems(prevItems =>
      prevItems.map(item =>
        item.id === id || `travel-${item.order}` === id
          ? { ...item, ...updates }
          : item
      )
    )
  }

  const removeTravelItem = (id: string) => {
    setTravelItems(prevItems =>
      prevItems
        .filter(item => item.id !== id && `travel-${item.order}` !== id)
        .map((item, index) => ({ ...item, order: index }))
    )
  }

  const updateCityId = (index: number, id: string) => {
    setTravelItems(prevItems => {
      const newItems = [...prevItems]
      if (index === 0) {
        if (newItems[0]) {
          newItems[0] = { ...newItems[0], from: id }
        }
      } else {
        if (newItems[index - 1]) {
          newItems[index - 1] = { ...newItems[index - 1], to: id }
        }
        if (newItems[index]) {
          newItems[index] = { ...newItems[index], from: id }
        }
      }
      return newItems
    })
  }

  const calculateCityItems = (travelItems: TravelItemType[]) => {
    const cityItems = travelItems.reduce((acc, item, index) => {
      if (index === 0) {
        acc.push({
          id: `city-${index}`,
          cityId: item.from || '',
          startDate: item.start_date,
          endDate: item.start_date
        })
      }
      acc.push({
        id: `city-${index + 1}`,
        cityId: item.to || '',
        startDate: item.arrival_date,
        endDate:
          index === travelItems.length - 1
            ? null
            : travelItems[index + 1]?.start_date
      })
      return acc
    }, [] as { id: string; cityId: string; startDate: string | null; endDate: string | null }[])

    return cityItems.length === 0
      ? [{ id: 'city-0', cityId: '', startDate: null, endDate: null }]
      : cityItems
  }

  const handleSaveTrip = () => {
    // validation

    // save trip
    if (props.edit && props.trip.id) {
      updateTrip({
        id: props.trip.id,
        trip,
        travelItems
      })
    } else {
      createTrip({
        trip,
        travelItems
      })
    }
  }

  return (
    <div className='container mx-auto p-4 space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold'>Trip Planner</h1>
        <Button onClick={handleSaveTrip}>Save Trip</Button>
      </div>

      <Card>
        <CardContent className='pt-6 space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='trip-name'>Trip Name</Label>
            <Input
              id='trip-name'
              value={trip.name}
              onChange={e =>
                setTrip(prev => ({ ...prev, name: e.target.value }))
              }
              placeholder='Enter trip name'
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='trip-description'>Description</Label>
            <Textarea
              id='trip-description'
              value={trip.description || ''}
              onChange={e =>
                setTrip(prev => ({ ...prev, description: e.target.value }))
              }
              placeholder='Enter trip description'
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <TripMap trip={trip} />

      <TripList
        travelItems={travelItems}
        cityItems={calculateCityItems(travelItems)}
        updateTravelItem={updateTravelItem}
        removeTravelItem={removeTravelItem}
        updateCityId={updateCityId}
        addTravelItem={addCity}
      />
    </div>
  )
}
