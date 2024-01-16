import { z } from 'zod'

const AppProviderSchema = z.object({
  icon: z.string(),
  name: z.string()
})

const MimeTypeSchema = z.object({
  allow_creation: z.boolean().optional(),
  app_providers: z.array(AppProviderSchema),
  default_application: z.string().optional(),
  description: z.string().optional(),
  ext: z.string().optional(),
  mime_type: z.string(),
  name: z.string().optional()
})

export const AppListSchema = z.object({
  'mime-types': z.array(MimeTypeSchema)
})
