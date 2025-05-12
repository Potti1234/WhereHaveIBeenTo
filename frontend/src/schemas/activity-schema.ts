import { z } from 'zod'

export const activitySchema = z.object({
  id: z.string().nonempty({ message: "ID cannot be empty" }).optional(),
  title: z.string().nonempty({ message: "Title cannot be empty" }).optional(),
  description: z.string().nonempty({ message: "Description cannot be empty" }).optional(),
  image: z.string().optional(),
  review_amount: z.number().int().min(0, { message: "Review amount must be a non-negative integer" }).optional(),
  review_stars: z.number().min(0, { message: "Review stars must be non-negative" }).max(5, { message: "Review stars cannot exceed 5" }).optional(),
  duration: z.number().int().min(0, { message: "Duration must be a non-negative integer" }).optional(),
  price: z.number().min(0, { message: "Price must be non-negative" }).optional(),
  url: z.string().url({ message: "Invalid URL format" }).optional(),
  city: z.string().nonempty({ message: "City cannot be empty" }).optional(),
  created: z.string().optional(),
  updated: z.string().optional()
})

export const activityListSchema = z.array(activitySchema)

export type Activity = z.infer<typeof activitySchema>

export const activitiesAPIResponseSchema = z.object({
  products: z.array(activitySchema), // After transformation, products will match Activity schema
  totalCount: z.number().int().min(0)
})

export type ActivitiesAPIResponse = z.infer<typeof activitiesAPIResponseSchema>;
