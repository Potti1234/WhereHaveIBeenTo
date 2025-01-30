import { useSuspenseQuery } from '@tanstack/react-query'
import {
  outlineGeoJsonQueryOptions,
  withStatesGeoJsonQueryOptions,
  worldGeoJsonQueryOptions
} from '@/services/api-geo-json'

export function useGeoJson(countryId?: string) {
  const { data: worldGeoJson } = useSuspenseQuery(worldGeoJsonQueryOptions)

  const outlineGeoJsonQuery = useSuspenseQuery(outlineGeoJsonQueryOptions(countryId ?? ''))
  const withStatesGeoJsonQuery = useSuspenseQuery(withStatesGeoJsonQueryOptions(countryId ?? ''))

  const outlineGeoJson = countryId ? outlineGeoJsonQuery.data : undefined
  const withStatesGeoJson = countryId ? withStatesGeoJsonQuery.data : undefined

  return {
    worldGeoJson,
    outlineGeoJson,
    withStatesGeoJson
  }
} 