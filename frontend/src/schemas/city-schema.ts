import { z } from 'zod'
import { pbIdSchema } from './pb-schema'
import { countrySchema } from './country-schema'
import { stateSchema } from './state-schema'

export const citySchema = z.object({
  id: pbIdSchema.optional(),
  name: z.string().optional(),
  unaccented_name: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  country: pbIdSchema.optional(),
  state: z.union([pbIdSchema, z.literal('')]).optional(),
  wikiDataId: z.string().optional(),
  population: z.number().optional(),
  created: z.string().optional(),
  updated: z.string().optional()
})

export const cityWithCountrySchema = citySchema.extend({
  expand: z.object({
    country: countrySchema
  })
})

export const cityWithCountryAndStateSchema = citySchema.extend({
  expand: z.object({
    country: countrySchema,
    state: stateSchema.optional().nullable()
  })
})

export const cityWithCountryAndStateListSchema = z.array(cityWithCountryAndStateSchema)

export const cityListSchema = z.array(citySchema)

export type City = z.infer<typeof citySchema>

// Helper type for expanded city records
export type CityWithExpand<T = unknown> = City & {
  expand?: T
} 

export type CityWithCountryAndState = z.infer<typeof cityWithCountryAndStateSchema>