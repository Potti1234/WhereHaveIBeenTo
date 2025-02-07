import { queryOptions } from "@tanstack/react-query";
import pb from "./pocketbase"
import { currencyListSchema, currencyConversionSchema } from "@/schemas/currency-schema"


export async function getCurrencyConversion(from: string, to: string) {
  const currency = await pb.send("/api/currency/conversion/" + from + "/" + to, {
  });
  return currencyConversionSchema.parse(currency)
}

export async function getCurrencies() {
  const currencies = await pb.collection("currency").getFullList()
  return currencyListSchema.parse(currencies)
}

export const currenciesQueryOptions =
  queryOptions({
    queryKey: ['currencies'],
    queryFn: () => getCurrencies(),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000
  })