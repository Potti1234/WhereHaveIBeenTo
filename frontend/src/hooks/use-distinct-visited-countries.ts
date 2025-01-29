import { useSuspenseQuery } from '@tanstack/react-query'
import {
  distinctVisitedCountriesQueryOptions
} from '@/services/api-distinct-visited-countries'


export function useDistinctVisitedCountries(userId: string) {
  const { data: distinctVisitedCountries } = useSuspenseQuery(
    distinctVisitedCountriesQueryOptions(userId)
  )

  return {
    distinctVisitedCountries
  }
} 