import { z } from 'zod'
import { pbIdSchema } from './pb-schema'

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
  user: pbIdSchema.optional(),
  created: z.string().optional(),
  updated: z.string().optional()
})

export const tripListSchema = z.array(tripSchema)

export type TripType = z.infer<typeof tripSchema>
export type TravelItemType = z.infer<typeof travelItemSchema>

export const tripSchemaTravelItemExpandedSchema = tripSchema.extend({
  expand: z.object({
    travel_items: z.array(travelItemSchema)
  })
})

export const tripSchemaTravelItemExpandedListSchema = z.array(tripSchemaTravelItemExpandedSchema)

export interface CityItemType {
  id: string
  cityId: string
  startDate: string | null
  endDate: string | null
}
