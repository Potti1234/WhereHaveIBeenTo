import { queryOptions } from '@tanstack/react-query'
import { pb } from './pocketbase'
import { 
  distinctVisitedCountryListSchema 
} from '@/schemas/distinct-visited-countries-schema'
import { PbId } from '@/schemas/pb-schema'

export async function getDistinctVisitedCountries(userId: PbId) {
  const countries = await pb.collection('distinct_visited_countries').getFullList({
    filter: `user = "${userId}"`
  })
  return distinctVisitedCountryListSchema.parse(countries)
}

export const distinctVisitedCountriesQueryOptions = (userId: string) =>
  queryOptions({
    queryKey: ['distinct-visited-countries', userId],
    queryFn: () => getDistinctVisitedCountries(userId),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000
  }) 