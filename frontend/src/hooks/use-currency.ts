import { useSuspenseQuery } from '@tanstack/react-query'
import {
  currenciesQueryOptions,
} from '@/services/api-currency'
import { errorToast } from '@/lib/toast'


export function useCurrency() {
  const { data: currencies } = useSuspenseQuery(currenciesQueryOptions)

  const getCurrencyConversionFromTo = async (from: string, to: string) => {
    const fromRate = currencies.find((currency) => currency.code === from)?.rate
    const toRate = currencies.find((currency) => currency.code === to)?.rate

    if (!fromRate || !toRate) {
      errorToast('Could not fetch currency conversion', 'Invalid currency code')
      return 0
    }

    return toRate / fromRate

  }

  return {
    currencies,
    getCurrencyConversionFromTo
  }
} 