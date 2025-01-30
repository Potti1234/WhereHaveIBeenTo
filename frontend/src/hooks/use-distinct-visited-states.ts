import { useSuspenseQuery } from '@tanstack/react-query'
import {
  distinctVisitedStatesCountQueryOptions,
  distinctVisitedStatesQueryOptions
} from '@/services/api-distinct-visited-states'

export function useDistinctVisitedStates(userId: string, countryName?: string) {
  const { data: statesCount } = useSuspenseQuery(
    distinctVisitedStatesCountQueryOptions(userId)
  )

  const statesInCountryQuery = useSuspenseQuery(
    distinctVisitedStatesQueryOptions(userId, countryName ?? '')
  )
  const statesInCountry = countryName ? statesInCountryQuery.data : undefined

  return {
    statesCount,
    statesInCountry
  }
} 