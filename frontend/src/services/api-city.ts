import { queryOptions } from '@tanstack/react-query'
import pb from "./pocketbase"
import { cityListSchema, citySchema, cityWithCountrySchema, cityWithCountryAndStateListSchema, cityWithCountryAndStateSchema } from '@/schemas/city-schema'
import { PbId } from '@/schemas/pb-schema'


export async function getCity(cityId: PbId) {
    if (!cityId) {
        return null
    }
    const city = await pb.collection('city').getOne(cityId)
    return citySchema.parse(city)
}

export async function getCityWithCountry(cityId: PbId) {
    if (!cityId) {
        return null
    }
    const city = await pb.collection('city').getOne(cityId, {expand : 'country'})
    return cityWithCountrySchema.parse(city)
}

export async function getCitiesThatStartWith(input: string) {
    const cities = await pb.collection('city').getList(1, 50, {
        filter: `unaccented_name~'${input}%'`,
        sort: '-population',
        expand: 'country, state'
    })
    return cityWithCountryAndStateListSchema.parse(cities.items)
}

export async function getSearchCityById(cityId: PbId) {
    if (!cityId) {
        return null
    }
    const city = await pb.collection('city').getOne(cityId, {expand: 'country, state'})
    return cityWithCountryAndStateSchema.parse(city)
}

export async function getRandomCities(amount: number) {
    const cities = await pb.collection('city').getList(1, amount, {
        sort: '@random'
    })
    return cityListSchema.parse(cities.items)
}

export const cityQueryOptions = (cityId: string) => 
    queryOptions({
        queryKey: ['cities', cityId],
        queryFn: () => getCity(cityId),
        staleTime: 30 * 1000,
        gcTime: 5 * 60 * 1000
    })

export const cityWithCountryQueryOptions = (cityId: string) =>
    queryOptions({
        queryKey: ['cities', cityId, 'withCountry'],
        queryFn: () => getCityWithCountry(cityId),
        staleTime: 30 * 1000,
        gcTime: 5 * 60 * 1000
    })

export const searchCityByIdQueryOptions = (cityId: string) =>
    queryOptions({
        queryKey: ['cities', cityId, 'search'],
        queryFn: () => getSearchCityById(cityId),
        staleTime: 30 * 1000,
        gcTime: 5 * 60 * 1000
    })


