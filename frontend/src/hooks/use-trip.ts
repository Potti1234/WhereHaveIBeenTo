import { useSuspenseQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  tripsQueryOptions,
  tripQueryOptions,
  createTrip as createTripApi,
  updateTrip as updateTripApi,
  deleteTrip as deleteTripApi
} from '@/services/api-trip'
import { errorToast, successToast } from '@/lib/toast'
import type { TripType, TravelItemType } from '@/schemas/trip-schema'

export function useTrip(tripId?: string) {
  const queryClient = useQueryClient()

  const { data: trips } = useSuspenseQuery(tripsQueryOptions)

  const { data: trip } = tripId
    ? useSuspenseQuery(tripQueryOptions(tripId))
    : { data: null }

  const createTripMutation = useMutation({
    mutationFn: ({
      trip,
      travelItems
    }: {
      trip: TripType
      travelItems: TravelItemType[]
    }) => createTripApi(trip, travelItems),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip'] })
      successToast('Trip created successfully')
    },
    onError: error => {
      console.error(error)
      errorToast('Failed to create trip')
    }
  })

  const updateTripMutation = useMutation({
    mutationFn: ({
      id,
      trip,
      travelItems
    }: {
      id: string
      trip: TripType
      travelItems: TravelItemType[]
    }) => updateTripApi(id, trip, travelItems),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip'] })
      successToast('Trip updated successfully')
    },
    onError: error => {
      console.error(error)
      errorToast('Failed to update trip')
    }
  })

  const deleteTripMutation = useMutation({
    mutationFn: (id: string) => deleteTripApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip'] })
      successToast('Trip deleted successfully')
    },
    onError: error => {
      console.error(error)
      errorToast('Failed to delete trip')
    }
  })

  return {
    trip,
    trips,
    createTrip: createTripMutation.mutate,
    updateTrip: updateTripMutation.mutate,
    deleteTrip: deleteTripMutation.mutate,
    isLoading:
      createTripMutation.isPending ||
      updateTripMutation.isPending ||
      deleteTripMutation.isPending
  }
} 