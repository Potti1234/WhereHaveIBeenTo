import { queryOptions } from '@tanstack/react-query'
import pb from './pocketbase'
import { 
  visitedCitySchema,
  visitedCityWithExpandListSchema 
} from '@/schemas/visited-city-schema'

import { PbId } from '@/schemas/pb-schema'

export async function getVisitedCitiesCount(userId: PbId) {
  const cities = await pb.collection('visited_city').getFullList({
    filter: `user = "${userId}"`,
    skipTotal: false
  })
  if(cities === undefined) {
    return 0
  }
  return cities.length
}

export async function createVisitedCity(userId: PbId, cityId: PbId) {
  if (!userId || !cityId) {
    throw new Error('User ID and city ID are required')
  }
  const record = await pb.collection('visited_city').create({
    user: userId,
    city: cityId
  })
  return visitedCitySchema.parse(record)
}

export async function deleteVisitedCity(userId: PbId, visitedCityId: PbId) {
  await pb.collection('visited_city').delete(visitedCityId, {
    filter: `user = "${userId}"`
  })
}

export async function getVisitedCitiesWithCityAndCountry(userId: PbId) {
  const cities = await pb.collection('visited_city').getFullList({
    filter: `user = "${userId}"`,
    expand: 'city,city.country'
  })
  return visitedCityWithExpandListSchema.parse(cities)
}

export const visitedCitiesQueryOptions = (userId: string) =>
  queryOptions({
    queryKey: ['visited-cities', userId],
    queryFn: () => getVisitedCitiesWithCityAndCountry(userId),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000
  })

export const visitedCitiesCountQueryOptions = (userId: string) =>
  queryOptions({
    queryKey: ['visited-cities-count', userId],
    queryFn: () => getVisitedCitiesCount(userId),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000
  }) 