import { z } from 'zod'
import { pbIdSchema } from './pb-schema'

export const distinctVisitedStateSchema = z.object({
  id: z.string().optional(),
  user: pbIdSchema,
  name: z.string().optional(),
  country_name: z.string().optional(),
  created: z.string().optional(),
  updated: z.string().optional()
})

export const distinctVisitedStateListSchema = z.array(distinctVisitedStateSchema)

export type DistinctVisitedState = z.infer<typeof distinctVisitedStateSchema> 