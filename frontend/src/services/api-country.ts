import { queryOptions } from '@tanstack/react-query'
import { pb } from './pocketbase'
import { countryListSchema, countrySchema } from '@/schemas/country-schema'
import { PbId } from '@/schemas/pb-schema'

export async function getCountry(countryId: PbId) {
  if (!countryId) {
    return null
  }
  const country = await pb.collection('country').getOne(countryId)
  return countrySchema.parse(country)
}


export async function getCountries() {
  const countries = await pb.collection('country').getFullList()
  return countryListSchema.parse(countries)
}

export async function getRandomCountries(amount: number) {
  const countries = await pb.collection('country').getList(1, amount, {
    sort: '@random'
  })
  return countryListSchema.parse(countries.items)
}

export const countryQueryOptions = (countryId: string) =>
  queryOptions({
    queryKey: ['countries', countryId],
    queryFn: () => getCountry(countryId),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000
  })

export const countriesQueryOptions = queryOptions({
  queryKey: ['countries'],
  queryFn: () => getCountries(),
  staleTime: 30 * 1000,
  gcTime: 5 * 60 * 1000
})
