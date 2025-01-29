import { useSuspenseQuery } from '@tanstack/react-query'
import {
  outlineGeoJsonQueryOptions,
  withStatesGeoJsonQueryOptions,
  worldGeoJsonQueryOptions
} from '@/services/api-geo-json'

export function useGeoJson(countryId?: string) {
  const { data: worldGeoJson } = useSuspenseQuery(worldGeoJsonQueryOptions)

  const { data: outlineGeoJson } = countryId
    ? useSuspenseQuery(outlineGeoJsonQueryOptions(countryId))
    : { data: undefined }

  const { data: withStatesGeoJson } = countryId
    ? useSuspenseQuery(withStatesGeoJsonQueryOptions(countryId))
    : { data: undefined }

  return {
    worldGeoJson,
    outlineGeoJson,
    withStatesGeoJson
  }
} 