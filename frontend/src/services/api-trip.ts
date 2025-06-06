import { queryOptions } from '@tanstack/react-query'
import pb from './pocketbase'
import { tripSchema, type TripType, type TravelItemType, tripSchemaTravelItemAndCityFromToExpandedSchema, tripSchemaTravelItemAndCityFromToExpandedListSchema, type TripDayType } from '@/schemas/trip-schema'
import { PbId } from '@/schemas/pb-schema'

interface ExpandObject {
  expand?: {
    travel_items?: Array<TravelItemType & { 
      expand?: { 
        from?: any
        to?: any 
      } 
    }>
  }
}

export async function getTrip(tripId: PbId) {
  if (!tripId) {
    return null
  }
  const trip = await pb.collection('trip').getOne(tripId, {
    expand: 'travel_items,travel_items.from,travel_items.to,trip_days'
  }) as TripType & ExpandObject

  // Filter out travel items with missing city data
  if (trip.expand?.travel_items) {
    trip.expand.travel_items = trip.expand.travel_items.filter(item => 
      item.expand?.from && item.expand?.to
    )
  }
  return tripSchemaTravelItemAndCityFromToExpandedSchema.parse(trip)
}

export async function getTrips() {
  const trips = await pb.collection('trip').getFullList({
    sort: '-created',
    expand: 'travel_items,travel_items.from,travel_items.to, trip_days'
  }) as Array<TripType & ExpandObject>

  // Filter out travel items with missing city data for each trip
  trips.forEach(trip => {
    if (trip.expand?.travel_items) {
      trip.expand.travel_items = trip.expand.travel_items.filter(item => 
        item.expand?.from && item.expand?.to
      )
    }
  })

  return tripSchemaTravelItemAndCityFromToExpandedListSchema.parse(trips)
}

export async function createTrip(trip: TripType, travelItems: TravelItemType[], tripDays: TripDayType[]) {
  const newTrip = await pb.collection('trip').create(trip)
  
  // Create travel items with references to the new trip
  const createdTravelItems = await Promise.all(
    travelItems.map((item, index) => 
      pb.collection('travel_item').create({
        ...item,
        trip: newTrip.id,
        order: index,
        user: trip.user
      })
    )
  )

  // Create trip days with references to the new trip
  const createdTripDays = await Promise.all(
    tripDays.map((day) => 
      pb.collection('trip_day').create({
        ...day,
        trip: newTrip.id
      })
    )
  )

  // Update the trip with the created travel items and trip days
  await pb.collection('trip').update(newTrip.id, {
    travel_items: createdTravelItems.map(item => item.id),
    trip_days: createdTripDays.map(day => day.id)
  })

  return {
    ...tripSchema.parse(newTrip),
    travel_items: createdTravelItems,
    trip_days: createdTripDays
  }
}

export async function updateTrip(tripId: PbId, trip: TripType, travelItems: TravelItemType[], tripDays: TripDayType[]) {
  const updatedTrip = await pb.collection('trip').update(tripId, trip)
  
  // Delete existing travel items
  const existingItems = await pb.collection('travel_item').getFullList({
    filter: `trip = "${tripId}"`
  })
  await Promise.all(existingItems.map(item => 
    pb.collection('travel_item').delete(item.id)
  ))

  // Delete existing trip days
  const existingDays = await pb.collection('trip_day').getFullList({
    filter: `trip = "${tripId}"`
  })
  await Promise.all(existingDays.map(day => 
    pb.collection('trip_day').delete(day.id)
  ))

  // Create new travel items
  const createdTravelItems = await Promise.all(
    travelItems.map((item, index) => 
      pb.collection('travel_item').create({
        ...item,
        trip: tripId,
        order: index,
        user: trip.user
      })
    )
  )

  // Create new trip days
  const createdTripDays = await Promise.all(
    tripDays.map((day) => 
      pb.collection('trip_day').create({
        ...day,
        trip: tripId
      })
    )
  )

  await pb.collection('trip').update(tripId, {
    travel_items: createdTravelItems.map(item => item.id),
    trip_days: createdTripDays.map(day => day.id)
  })

  return {
    ...tripSchema.parse(updatedTrip),
    travel_items: createdTravelItems,
    trip_days: createdTripDays
  }
}

export async function deleteTrip(tripId: PbId) {
  // Delete associated travel items first
  const travelItems = await pb.collection('travel_item').getFullList({
    filter: `trip = "${tripId}"`
  })
  await Promise.all(travelItems.map(item => 
    pb.collection('travel_item').delete(item.id)
  ))

  // Delete associated trip days
  const tripDays = await pb.collection('trip_day').getFullList({
    filter: `trip = "${tripId}"`
  })
  await Promise.all(tripDays.map(day =>
    pb.collection('trip_day').delete(day.id)
  ))
  
  await pb.collection('trip').delete(tripId)
}

export const tripQueryOptions = (tripId: string) =>
  queryOptions({
    queryKey: ['trip', tripId],
    queryFn: () => getTrip(tripId),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000
  })

export const tripsQueryOptions = queryOptions({
  queryKey: ['trip'],
  queryFn: () => getTrips(),
  staleTime: 30 * 1000,
  gcTime: 5 * 60 * 1000
}) 