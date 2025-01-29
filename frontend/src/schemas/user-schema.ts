import { z } from 'zod'
import { pbIdSchema } from './pb-schema'
import { settingsSchema} from './settings-schema'

export const userSchema = z.object({
  id: pbIdSchema,
  avatar: z.string(),
  email: z.string().email('Invalid email'),
  name: z.string().min(2, 'Too short').optional().or(z.literal('')),
  verified: z.boolean()
})

export type User = z.infer<typeof userSchema>

export const userWithSettingsSchema = userSchema.extend({
  settings: settingsSchema
})

export type UserWithSettings = z.infer<typeof userWithSettingsSchema>

export const updateUserSettingsSchema = z
  .object({
    avatar: z.instanceof(File).nullish().optional(),
    name: z.string().min(2, 'Too short').optional().or(z.literal('')),
    oldPassword: z.string().optional(),
    password: z.string().optional(),
    passwordConfirm: z.string().optional()
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'Passwords must match',
    path: ['passwordConfirm']
  })
  .refine(
    (data) =>
      (data.oldPassword === '' && data.password === '') ||
      data.oldPassword !== data.password,
    {
      message: 'New password is the same',
      path: ['password']
    }
  )
  .refine(
    (data) => {
      const anyPasswordFieldNotEmpty =
        data.oldPassword || data.password || data.passwordConfirm
      const allPasswordFieldsFilled =
        data.oldPassword && data.password && data.passwordConfirm
      return !anyPasswordFieldNotEmpty || allPasswordFieldsFilled
    },
    {
      message: 'Complete all password fields',
      path: ['password']
    }
  )

export type UpdateUserSettingsFields = z.infer<typeof updateUserSettingsSchema>
