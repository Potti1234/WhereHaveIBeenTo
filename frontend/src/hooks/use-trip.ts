import { useSuspenseQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  tripsQueryOptions,
  tripQueryOptions,
  createTrip as createTripApi,
  updateTrip as updateTripApi,
  deleteTrip as deleteTripApi
} from '@/services/api-trip'
import { errorToast, successToast } from '@/lib/toast'
import type { TravelItemType, ExpandedTripType } from '@/schemas/trip-schema'

export function useTrip(tripId?: string) {
  const queryClient = useQueryClient()

  const { data: trips } = useSuspenseQuery(tripsQueryOptions)

  const { data: trip } = useSuspenseQuery(tripQueryOptions(tripId ?? ''))

  const createTripMutation = useMutation({
    mutationFn: ({
      trip,
      travelItems
    }: {
      trip: ExpandedTripType
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
      trip: ExpandedTripType
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
    trip: trip as ExpandedTripType | null,
    trips: trips as ExpandedTripType[],
    createTrip: createTripMutation.mutate,
    updateTrip: updateTripMutation.mutate,
    deleteTrip: deleteTripMutation.mutate,
    isLoading:
      createTripMutation.isPending ||
      updateTripMutation.isPending ||
      deleteTripMutation.isPending
  }
} 