import { useSuspenseQuery } from '@tanstack/react-query'
import {
  countriesQueryOptions,
  countryQueryOptions,
  getRandomCountries
} from '@/services/api-country'
import { errorToast } from '@/lib/toast'

export function useCountry(countryId?: string) {
  const { data: countries } = useSuspenseQuery(countriesQueryOptions)

  const countryQuery = useSuspenseQuery(countryQueryOptions(countryId ?? ''))
  const { data: country } = countryId ? countryQuery : { data: undefined }

  const getRandomCountryList = async (amount: number) => {
    try {
      return await getRandomCountries(amount)
    } catch (error) {
      console.error(error)
      errorToast('Could not fetch random countries', error)
      return []
    }
  }

  return {
    country,
    countries,
    getRandomCountryList
  }
} 