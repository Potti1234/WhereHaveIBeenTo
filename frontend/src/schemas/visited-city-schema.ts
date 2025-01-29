import { z } from 'zod'
import { pbIdSchema } from './pb-schema'
import { cityWithCountrySchema } from './city-schema'

export const visitedCitySchema = z.object({
  id: pbIdSchema.optional(),
  user: pbIdSchema,
  city: pbIdSchema,
  created: z.string().optional(),
  updated: z.string().optional()
})

export const visitedCityListSchema = z.array(visitedCitySchema)

// Schema for expanded records
export const visitedCityWithExpandSchema = visitedCitySchema.extend({
  expand: z.object({
      city: cityWithCountrySchema
  }).optional()
})

export const visitedCityWithExpandListSchema = z.array(visitedCityWithExpandSchema)

export type VisitedCity = z.infer<typeof visitedCitySchema>
export type VisitedCityWithExpand = z.infer<typeof visitedCityWithExpandSchema> 