import { z } from 'zod'
import { pbIdSchema } from './pb-schema'

export const stateSchema = z.object({
  id: pbIdSchema,
  name: z.string(),
  country: pbIdSchema,
  state_code: z.string().optional(),
  type: z.string().optional(),
  created: z.string().optional(),
  updated: z.string().optional()
})

export const stateListSchema = z.array(stateSchema)
