import { z } from 'zod'
import { pbIdSchema } from './pb-schema'

export const currencySchema = z.object({
  id: pbIdSchema.optional(),
  name: z.string().optional(),
  code: z.string().optional(),
  rate: z.number().optional(),
  created: z.string().optional(),
  updated: z.string().optional()
})

export const currencyConversionSchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  rate: z.number().optional()
})

export const currencyListSchema = z.array(currencySchema)

export type Currency = z.infer<typeof currencySchema> 