import { useSuspenseQuery } from '@tanstack/react-query'
import {
  distinctVisitedStatesCountQueryOptions,
  distinctVisitedStatesQueryOptions
} from '@/services/api-distinct-visited-states'

export function useDistinctVisitedStates(userId: string, countryName?: string) {
  const { data: statesCount } = useSuspenseQuery(
    distinctVisitedStatesCountQueryOptions(userId)
  )

  const { data: statesInCountry } = countryName
    ? useSuspenseQuery(
        distinctVisitedStatesQueryOptions(userId, countryName)
      )
    : { data: undefined }

  return {
    statesCount,
    statesInCountry
  }
} 