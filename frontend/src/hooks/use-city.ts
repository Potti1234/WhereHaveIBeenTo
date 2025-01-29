import { useSuspenseQuery } from '@tanstack/react-query'
import { 
  cityQueryOptions, 
  cityWithCountryQueryOptions,
  getCitiesThatStartWith,
  getRandomCities
} from '@/services/api-city'
import { errorToast } from '@/lib/toast'

export function useCity(cityId: string) {
  const { data: city } = useSuspenseQuery(cityQueryOptions(cityId))
  
  const { data: cityWithCountry } = useSuspenseQuery(
    cityWithCountryQueryOptions(cityId)
  )

  const searchCities = async (searchTerm: string) => {
    try {
      return await getCitiesThatStartWith(searchTerm)
    } catch (error) {
      console.error(error)
      errorToast('Could not search cities', error)
      return []
    }
  }

  const getRandomCityList = async (amount: number) => {
    try {
      return await getRandomCities(amount)
    } catch (error) {
      console.error(error)
      errorToast('Could not fetch random cities', error)
      return []
    }
  }

  return {
    city,
    cityWithCountry,
    searchCities,
    getRandomCityList
  }
} 