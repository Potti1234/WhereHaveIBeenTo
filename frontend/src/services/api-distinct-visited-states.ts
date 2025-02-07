import { queryOptions } from '@tanstack/react-query'
import pb from './pocketbase'
import { 
  distinctVisitedStateListSchema 
} from '@/schemas/distinct-visited-states-schema'
import { PbId } from '@/schemas/pb-schema'

export async function getDistinctVisitedStatesCount(userId: PbId) {
  const states = await pb.collection('distinct_visited_states').getFullList({
    filter: `user = "${userId}"`,
    skipTotal: false
  })
  return states.length
}

export async function getDistinctVisitedStatesOfCountry(userId: PbId, countryName: string) {
  const states = await pb.collection('distinct_visited_states').getFullList({
    filter: `user = "${userId}" && country_name = "${countryName}"`
  })
  return distinctVisitedStateListSchema.parse(states)
}

export const distinctVisitedStatesCountQueryOptions = (userId: string) =>
  queryOptions({
    queryKey: ['distinct-visited-states-count', userId],
    queryFn: () => getDistinctVisitedStatesCount(userId),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000
  })

export const distinctVisitedStatesQueryOptions = (userId: string, countryName: string) =>
  queryOptions({
    queryKey: ['distinct-visited-states', userId, countryName],
    queryFn: () => getDistinctVisitedStatesOfCountry(userId, countryName),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000
  }) 