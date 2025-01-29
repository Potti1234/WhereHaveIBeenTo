import { z } from 'zod'
import { pbIdSchema } from './pb-schema'

export const countrySchema = z.object({
  id: pbIdSchema.optional(),
  name: z.string().optional(),
  iso2: z.string().optional(),
  iso3: z.string().optional(),
  numeric_code: z.number().optional(),
  phone_code: z.string().optional(),
  capital: z.string().optional(),
  currency: z.string().optional(),
  currency_name: z.string().optional(),
  currency_symbol: z.string().optional(),
  tld: z.string().optional(),
  native: z.string().optional(),
  region: pbIdSchema.optional().or(z.string().optional()),
  subregion: pbIdSchema.optional().or(z.string().optional()),
  nationality: z.string().optional(),
  timezones: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  emoji: z.string().optional(),
  emojiU: z.string().optional(),
  created: z.string().optional(),
  updated: z.string().optional()
})

export const countryListSchema = z.array(countrySchema)

export type Country = z.infer<typeof countrySchema> 