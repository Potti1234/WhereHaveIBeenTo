/**
* This file was @generated using pocketbase-typegen
*/

import type PocketBase from 'pocketbase'
import type { RecordService } from 'pocketbase'

export enum Collections {
	Authorigins = "_authOrigins",
	Externalauths = "_externalAuths",
	Mfas = "_mfas",
	Otps = "_otps",
	Superusers = "_superusers",
	City = "city",
	Country = "country",
	Currency = "currency",
	DistinctVisitedCountries = "distinct_visited_countries",
	DistinctVisitedStates = "distinct_visited_states",
	GeoJson = "geo_json",
	Region = "region",
	Settings = "settings",
	State = "state",
	Subregion = "subregion",
	TravelItem = "travel_item",
	Trip = "trip",
	Users = "users",
	VisitedCity = "visited_city",
}

// Alias types for improved usability
export type IsoDateString = string
export type RecordIdString = string
export type HTMLString = string

// System fields
export type BaseSystemFields<T = never> = {
	id: RecordIdString
	collectionId: string
	collectionName: Collections
	expand?: T
}

export type AuthSystemFields<T = never> = {
	email: string
	emailVisibility: boolean
	username: string
	verified: boolean
} & BaseSystemFields<T>

// Record types for each collection

export type AuthoriginsRecord = {
	collectionRef: string
	created?: IsoDateString
	fingerprint: string
	id: string
	recordRef: string
	updated?: IsoDateString
}

export type ExternalauthsRecord = {
	collectionRef: string
	created?: IsoDateString
	id: string
	provider: string
	providerId: string
	recordRef: string
	updated?: IsoDateString
}

export type MfasRecord = {
	collectionRef: string
	created?: IsoDateString
	id: string
	method: string
	recordRef: string
	updated?: IsoDateString
}

export type OtpsRecord = {
	collectionRef: string
	created?: IsoDateString
	id: string
	password: string
	recordRef: string
	sentTo?: string
	updated?: IsoDateString
}

export type SuperusersRecord = {
	created?: IsoDateString
	email: string
	emailVisibility?: boolean
	id: string
	password: string
	tokenKey: string
	updated?: IsoDateString
	verified?: boolean
}

export type CityRecord = {
	country: RecordIdString
	created?: IsoDateString
	id: string
	latitude?: number
	longitude?: number
	name?: string
	state?: RecordIdString
	unaccented_name?: string
	updated?: IsoDateString
	wikiDataId?: string
}

export type CountryRecord = {
	capital?: string
	created?: IsoDateString
	currency?: string
	currency_name?: string
	currency_symbol?: string
	emoji?: string
	emojiU?: string
	id: string
	iso2?: string
	iso3?: string
	latitude?: number
	longitude?: number
	name?: string
	nationality?: string
	native?: string
	numeric_code?: number
	phone_code?: string
	region?: RecordIdString
	subregion?: RecordIdString
	timezones?: string
	tld?: string
	updated?: IsoDateString
}

export type CurrencyRecord = {
	code?: string
	created?: IsoDateString
	id: string
	name?: string
	rate?: number
	updated?: IsoDateString
}

export type DistinctVisitedCountriesRecord = {
	id: string
	iso2?: string
	name?: string
	user?: RecordIdString
}

export type DistinctVisitedStatesRecord = {
	country_name?: string
	id: string
	name?: string
	user?: RecordIdString
}

export enum GeoJsonTypeOptions {
	"Outline" = "Outline",
	"WithStates" = "WithStates",
	"World" = "World",
}
export type GeoJsonRecord = {
	country?: RecordIdString
	created?: IsoDateString
	id: string
	json?: string
	type?: GeoJsonTypeOptions
	updated?: IsoDateString
}

export type RegionRecord = {
	created?: IsoDateString
	id: string
	name?: string
	updated?: IsoDateString
}

export type SettingsRecord = {
	authWithPasswordAvailable?: boolean
	created?: IsoDateString
	id: string
	updated?: IsoDateString
	user?: RecordIdString
}

export type StateRecord = {
	country?: RecordIdString
	created?: IsoDateString
	id: string
	name?: string
	state_code?: string
	type?: string
	updated?: IsoDateString
}

export type SubregionRecord = {
	created?: IsoDateString
	id: string
	name?: string
	region?: RecordIdString
	updated?: IsoDateString
}

export enum TravelItemTypeOptions {
	"plane" = "plane",
	"bus" = "bus",
	"car" = "car",
	"train" = "train",
}
export type TravelItemRecord = {
	arrival_date?: IsoDateString
	created?: IsoDateString
	from?: RecordIdString
	id: string
	order?: number
	start_date?: IsoDateString
	to?: RecordIdString
	trip?: RecordIdString
	type?: TravelItemTypeOptions
	updated?: IsoDateString
	user?: RecordIdString
}

export type TripRecord = {
	created?: IsoDateString
	description?: string
	id: string
	name?: string
	travel_items?: RecordIdString[]
	updated?: IsoDateString
	user?: RecordIdString
}

export type UsersRecord = {
	avatar?: string
	created?: IsoDateString
	email: string
	emailVisibility?: boolean
	id: string
	name?: string
	password: string
	tokenKey: string
	updated?: IsoDateString
	verified?: boolean
}

export type VisitedCityRecord = {
	city?: RecordIdString
	created?: IsoDateString
	id: string
	updated?: IsoDateString
	user?: RecordIdString
}

// Response types include system fields and match responses from the PocketBase API
export type AuthoriginsResponse<Texpand = unknown> = Required<AuthoriginsRecord> & BaseSystemFields<Texpand>
export type ExternalauthsResponse<Texpand = unknown> = Required<ExternalauthsRecord> & BaseSystemFields<Texpand>
export type MfasResponse<Texpand = unknown> = Required<MfasRecord> & BaseSystemFields<Texpand>
export type OtpsResponse<Texpand = unknown> = Required<OtpsRecord> & BaseSystemFields<Texpand>
export type SuperusersResponse<Texpand = unknown> = Required<SuperusersRecord> & AuthSystemFields<Texpand>
export type CityResponse<Texpand = unknown> = Required<CityRecord> & BaseSystemFields<Texpand>
export type CountryResponse<Texpand = unknown> = Required<CountryRecord> & BaseSystemFields<Texpand>
export type CurrencyResponse<Texpand = unknown> = Required<CurrencyRecord> & BaseSystemFields<Texpand>
export type DistinctVisitedCountriesResponse<Texpand = unknown> = Required<DistinctVisitedCountriesRecord> & BaseSystemFields<Texpand>
export type DistinctVisitedStatesResponse<Texpand = unknown> = Required<DistinctVisitedStatesRecord> & BaseSystemFields<Texpand>
export type GeoJsonResponse<Texpand = unknown> = Required<GeoJsonRecord> & BaseSystemFields<Texpand>
export type RegionResponse<Texpand = unknown> = Required<RegionRecord> & BaseSystemFields<Texpand>
export type SettingsResponse<Texpand = unknown> = Required<SettingsRecord> & BaseSystemFields<Texpand>
export type StateResponse<Texpand = unknown> = Required<StateRecord> & BaseSystemFields<Texpand>
export type SubregionResponse<Texpand = unknown> = Required<SubregionRecord> & BaseSystemFields<Texpand>
export type TravelItemResponse<Texpand = unknown> = Required<TravelItemRecord> & BaseSystemFields<Texpand>
export type TripResponse<Texpand = unknown> = Required<TripRecord> & BaseSystemFields<Texpand>
export type UsersResponse<Texpand = unknown> = Required<UsersRecord> & AuthSystemFields<Texpand>
export type VisitedCityResponse<Texpand = unknown> = Required<VisitedCityRecord> & BaseSystemFields<Texpand>

// Types containing all Records and Responses, useful for creating typing helper functions

export type CollectionRecords = {
	_authOrigins: AuthoriginsRecord
	_externalAuths: ExternalauthsRecord
	_mfas: MfasRecord
	_otps: OtpsRecord
	_superusers: SuperusersRecord
	city: CityRecord
	country: CountryRecord
	currency: CurrencyRecord
	distinct_visited_countries: DistinctVisitedCountriesRecord
	distinct_visited_states: DistinctVisitedStatesRecord
	geo_json: GeoJsonRecord
	region: RegionRecord
	settings: SettingsRecord
	state: StateRecord
	subregion: SubregionRecord
	travel_item: TravelItemRecord
	trip: TripRecord
	users: UsersRecord
	visited_city: VisitedCityRecord
}

export type CollectionResponses = {
	_authOrigins: AuthoriginsResponse
	_externalAuths: ExternalauthsResponse
	_mfas: MfasResponse
	_otps: OtpsResponse
	_superusers: SuperusersResponse
	city: CityResponse
	country: CountryResponse
	currency: CurrencyResponse
	distinct_visited_countries: DistinctVisitedCountriesResponse
	distinct_visited_states: DistinctVisitedStatesResponse
	geo_json: GeoJsonResponse
	region: RegionResponse
	settings: SettingsResponse
	state: StateResponse
	subregion: SubregionResponse
	travel_item: TravelItemResponse
	trip: TripResponse
	users: UsersResponse
	visited_city: VisitedCityResponse
}

// Type for usage with type asserted PocketBase instance
// https://github.com/pocketbase/js-sdk#specify-typescript-definitions

export type TypedPocketBase = PocketBase & {
	collection(idOrName: '_authOrigins'): RecordService<AuthoriginsResponse>
	collection(idOrName: '_externalAuths'): RecordService<ExternalauthsResponse>
	collection(idOrName: '_mfas'): RecordService<MfasResponse>
	collection(idOrName: '_otps'): RecordService<OtpsResponse>
	collection(idOrName: '_superusers'): RecordService<SuperusersResponse>
	collection(idOrName: 'city'): RecordService<CityResponse>
	collection(idOrName: 'country'): RecordService<CountryResponse>
	collection(idOrName: 'currency'): RecordService<CurrencyResponse>
	collection(idOrName: 'distinct_visited_countries'): RecordService<DistinctVisitedCountriesResponse>
	collection(idOrName: 'distinct_visited_states'): RecordService<DistinctVisitedStatesResponse>
	collection(idOrName: 'geo_json'): RecordService<GeoJsonResponse>
	collection(idOrName: 'region'): RecordService<RegionResponse>
	collection(idOrName: 'settings'): RecordService<SettingsResponse>
	collection(idOrName: 'state'): RecordService<StateResponse>
	collection(idOrName: 'subregion'): RecordService<SubregionResponse>
	collection(idOrName: 'travel_item'): RecordService<TravelItemResponse>
	collection(idOrName: 'trip'): RecordService<TripResponse>
	collection(idOrName: 'users'): RecordService<UsersResponse>
	collection(idOrName: 'visited_city'): RecordService<VisitedCityResponse>
}
