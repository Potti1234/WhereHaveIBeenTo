import { useState } from 'react'
import { TripList } from '@/components/trip/trip-list'
import type {
  TravelItemType,
  ExpandedTripType,
  ExpandedTravelItemType
} from '@/schemas/trip-schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { useTrip } from '@/hooks/use-trip'
import useAuth from '@/hooks/use-auth'
import { useEffect } from 'react'
import TripMap from './trip-map'
import { City } from '@/schemas/city-schema'

export default function TripPlanner (props: {
  trip: ExpandedTripType
  travelItems: ExpandedTravelItemType[]
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
  const [travelItems, setTravelItems] = useState<ExpandedTravelItemType[]>([])

  const { createTrip, updateTrip } = useTrip()

  useEffect(() => {
    if (props.edit) {
      setTrip(props.trip)
      setTravelItems(props.travelItems)
    } else {
      const startTravelItem: ExpandedTravelItemType = {
        type: 'bus',
        start_date: null,
        arrival_date: null,
        order: 0,
        from: '',
        to: '',
        expand: {
          from: {
            id: ''
          },
          to: { id: '' }
        }
      }
      setTravelItems([startTravelItem])
    }
  }, [props.edit])

  useEffect(() => {
    setTrip(prevTrip => ({
      ...prevTrip,
      expand: {
        ...prevTrip.expand,
        travel_items: travelItems
      }
    }))
  }, [travelItems])

  const addCity = (index: number) => {
    const newItem: ExpandedTravelItemType = {
      type: 'bus',
      start_date: null,
      arrival_date: null,
      order: index,
      from: travelItems[index - 1]?.to || '',
      to: '',
      expand: {
        from: travelItems[index - 1]?.expand?.to || { id: '' },
        to: { id: '' }
      }
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

  const updateCity = (index: number, city: City) => {
    setTravelItems(prevItems => {
      const newItems = [...prevItems]
      if (index === 0) {
        if (newItems[0]) {
          newItems[0] = {
            ...newItems[0],
            from: city.id,
            expand: { ...newItems[0].expand, from: city }
          }
        }
      } else {
        if (newItems[index - 1]) {
          newItems[index - 1] = {
            ...newItems[index - 1],
            to: city.id,
            expand: { ...newItems[index - 1].expand, to: city }
          }
        }
        if (newItems[index]) {
          newItems[index] = {
            ...newItems[index],
            from: city.id,
            expand: { ...newItems[index].expand, from: city }
          }
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

      <TripMap travelItems={travelItems} />

      <TripList
        travelItems={travelItems}
        cityItems={calculateCityItems(travelItems)}
        updateTravelItem={updateTravelItem}
        removeTravelItem={removeTravelItem}
        updateCity={updateCity}
        addTravelItem={addCity}
      />
    </div>
  )
}
