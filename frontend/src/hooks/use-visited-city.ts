import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import {
  visitedCitiesQueryOptions,
  visitedCitiesCountQueryOptions,
  createVisitedCity,
  deleteVisitedCity
} from '@/services/api-visited-city'
import { errorToast, successToast } from '@/lib/toast'
import { useQueryClient } from '@tanstack/react-query'

export function useVisitedCity(userId: string) {
  const queryClient = useQueryClient()

  const { data: visitedCities } = useSuspenseQuery(
    visitedCitiesQueryOptions(userId)
  )

  const { data: visitedCitiesCount } = useSuspenseQuery(
    visitedCitiesCountQueryOptions(userId)
  )

  const createMutation = useMutation({
    mutationFn: (cityId: string) => createVisitedCity(userId, cityId),
    onSuccess: () => {
      successToast('City added', 'Successfully marked city as visited')
      queryClient.invalidateQueries({ queryKey: ['visited-cities'] })
      queryClient.invalidateQueries({ queryKey: ['visited-cities-count'] })
    },
    onError: (error) => {
      console.error(error)
      errorToast('Could not add city', error)
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (visitedCityId: string) => deleteVisitedCity(userId, visitedCityId),
    onSuccess: () => {
      successToast('City removed', 'Successfully removed city from visited list')
      queryClient.invalidateQueries({ queryKey: ['visited-cities'] })
      queryClient.invalidateQueries({ queryKey: ['visited-cities-count'] })
    },
    onError: (error) => {
      console.error(error)
      errorToast('Could not remove city', error)
    }
  })

  return {
    visitedCities,
    visitedCitiesCount,
    addVisitedCity: createMutation.mutate,
    removeVisitedCity: deleteMutation.mutate,
    isAdding: createMutation.isPending,
    isRemoving: deleteMutation.isPending
  }
} 