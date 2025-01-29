import { CountryRecord, StateRecord, CityRecord } from "@/types/pocketbase-types"

export type ExpandCountryState = {
    country: CountryRecord
    state: StateRecord
}

export type ExpandCountry = {
    country: CountryRecord
}

export type ExpandCityAndCountry = {
    city: CityRecord
    country: CountryRecord
}