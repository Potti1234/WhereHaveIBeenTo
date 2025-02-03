import { queryOptions } from '@tanstack/react-query'
import { pb } from './pocketbase'
import { geoJsonSchema } from '@/schemas/geo-json-schema'
import { PbId } from '@/schemas/pb-schema'

export async function getOutlineGeoJson(countryId: PbId) {
  if (!countryId) {
    return null
  }
  const geoJson = await pb.collection('geo_json').getFirstListItem(
    `type = "Outline" && country = "${countryId}"`
  )
  return geoJsonSchema.parse(geoJson)
}


export async function getWithStatesGeoJson(countryId: PbId) {
  if (!countryId) {
    return null
  }
  const geoJson = await pb.collection('geo_json').getFirstListItem(
    `type = "WithStates" && country = "${countryId}"`
  )
  return geoJsonSchema.parse(geoJson)
}


export async function getWorldGeoJson() {
  const geoJson = await pb.collection('geo_json').getFirstListItem(
    'type = "World"'
  )
  return geoJsonSchema.parse(geoJson)
}

export const outlineGeoJsonQueryOptions = (countryId: string) =>
  queryOptions({
    queryKey: ['geo-json', 'outline', countryId],
    queryFn: () => getOutlineGeoJson(countryId),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    gcTime: 7 * 24 * 60 * 60 * 1000 // 1 week
  })

export const withStatesGeoJsonQueryOptions = (countryId: string) =>
  queryOptions({
    queryKey: ['geo-json', 'with-states', countryId],
    queryFn: () => getWithStatesGeoJson(countryId),
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 7 * 24 * 60 * 60 * 1000
  })

export const worldGeoJsonQueryOptions = queryOptions({
  queryKey: ['geo-json', 'world'],
  queryFn: () => getWorldGeoJson(),
  staleTime: 24 * 60 * 60 * 1000,
  gcTime: 7 * 24 * 60 * 60 * 1000
}) 