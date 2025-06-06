import { z } from 'zod'
import { pbIdSchema } from './pb-schema'
import { citySchema } from './city-schema'

export const travelItemSchema = z.object({
  id: pbIdSchema.optional(),
  from: pbIdSchema.optional().or(z.string().optional()),
  to: pbIdSchema.optional().or(z.string().optional()),
  type: z.enum(['plane', 'bus', 'car', 'train']),
  start_date: z.string().nullable(),
  arrival_date: z.string().nullable(),
  order: z.number().optional(),
  user: pbIdSchema.optional(),
  trip: pbIdSchema.optional(),
  created: z.string().optional(),
  updated: z.string().optional()
})

export const tripSchema = z.object({
  id: pbIdSchema.optional(),
  name: z.string(),
  description: z.string().optional(),
  travel_items: z.array(pbIdSchema).optional(),
  trip_days: z.array(pbIdSchema).optional(),
  user: pbIdSchema.optional(),
  created: z.string().optional(),
  updated: z.string().optional()
})

export const tripDaySchema = z.object({
  id: pbIdSchema.optional(),
  day: z.number(),
  description: z.string(),
  trip: pbIdSchema.optional(),
  created: z.string().optional(),
  updated: z.string().optional()
})

export const tripListSchema = z.array(tripSchema)

export type TripType = z.infer<typeof tripSchema>
export type TravelItemType = z.infer<typeof travelItemSchema>
export type TripDayType = z.infer<typeof tripDaySchema>

export const tripSchemaTravelItemExpandedSchema = tripSchema.extend({
  expand: z.object({
    travel_items: z.array(travelItemSchema)
  })
})

export const tripSchemaTravelItemExpandedListSchema = z.array(tripSchemaTravelItemExpandedSchema)

export const travelItemSchemaExpandCityFromToSchema = travelItemSchema.extend({
  expand: z.object({
    from: citySchema,
    to: citySchema
  })
})

export type ExpandedTravelItemType = z.infer<
  typeof travelItemSchemaExpandCityFromToSchema
>

export const tripSchemaTravelItemAndCityFromToExpandedSchema = tripSchema.extend({
  expand: z.object({
    travel_items: z.array(travelItemSchemaExpandCityFromToSchema).optional(),
    trip_days: z.array(tripDaySchema).optional()
  })
})

export const tripSchemaTravelItemAndCityFromToExpandedListSchema = z.array(tripSchemaTravelItemAndCityFromToExpandedSchema)

export type ExpandedTripType = z.infer<
  typeof tripSchemaTravelItemAndCityFromToExpandedSchema
>

export interface CityItemType {
  id: string
  cityId: string
  startDate: string | null
  endDate: string | null
}
