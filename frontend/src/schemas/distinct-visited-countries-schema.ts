import { z } from 'zod'
import { pbIdSchema } from './pb-schema'

export const distinctVisitedCountrySchema = z.object({
  id: z.string().optional(),
  user: pbIdSchema,
  name: z.string().optional(),
  iso2: z.string().optional(),
  created: z.string().optional(),
  updated: z.string().optional()
})

export const distinctVisitedCountryListSchema = z.array(distinctVisitedCountrySchema)

export type DistinctVisitedCountry = z.infer<typeof distinctVisitedCountrySchema> 