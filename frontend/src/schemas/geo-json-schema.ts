import { z } from 'zod'
import { pbIdSchema } from './pb-schema'

export const geoJsonTypeEnum = z.enum(['Outline', 'WithStates', 'World'])

export const geoJsonSchema = z.object({
  id: pbIdSchema.optional(),
  country: z.string().optional(),
  type: geoJsonTypeEnum,
  json: z.any().optional(),
  created: z.string().optional(),
  updated: z.string().optional()
})

export const geoJsonListSchema = z.array(geoJsonSchema)

export type GeoJson = z.infer<typeof geoJsonSchema> 