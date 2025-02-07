import { queryOptions } from '@tanstack/react-query'
import pb from './pocketbase'
import { PbId } from '@/schemas/pb-schema'

export async function getOutlineGeoJson(countryId: PbId) {
  if (!countryId) {
    return null
  }
  const geoJson = await pb.collection('geo_json').getFirstListItem(
    `type = "Outline" && country = "${countryId}"`
  )
  if (!geoJson.json) {
    return null
  }
  const res = pb.files.getURL(geoJson, geoJson.json)
  const response = await fetch(res)
  const json = await response.json()
  return json
}


export async function getWithStatesGeoJson(countryId: PbId) {
  if (!countryId) {
    return null
  }
  const geoJson = await pb.collection('geo_json').getFirstListItem(
    `type = "WithStates" && country = "${countryId}"`
  )
  if (!geoJson.json) {
    return null
  }
  const res = pb.files.getURL(geoJson, geoJson.json)
  const response = await fetch(res)
  const json = await response.json()
  return json
}


export async function getWorldGeoJson() {
  const geoJson = await pb.collection('geo_json').getFirstListItem(
    'type = "World"'
  )
  if (!geoJson.json) {
    return null
  }
  const res = pb.files.getURL(geoJson, geoJson.json)
  const response = await fetch(res)
  const json = await response.json()
  return json
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