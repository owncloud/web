import { z } from 'zod'

export const AppStoreRepositorySchema = z.object({
  name: z.string(),
  url: z.string()
})
export type AppStoreRepository = z.infer<typeof AppStoreRepositorySchema>

export const AppStoreConfigSchema = z.object({
  repositories: z.array(AppStoreRepositorySchema)
})

export const AppVersionSchema = z.object({
  version: z.string(),
  url: z.string(),
  filename: z.string().optional()
})

export const AppAuthorSchema = z.object({
  name: z.string(),
  email: z.string().optional(),
  url: z.string().optional()
})

export const AppImageSchema = z.object({
  url: z.string(),
  caption: z.string().optional()
})

export const AppResourceSchema = z.object({
  url: z.string(),
  label: z.string(),
  icon: z.string().optional()
})

export const RawAppSchema = z.object({
  id: z.string(),
  name: z.string(),
  subtitle: z.string(),
  description: z.string().optional(),
  license: z.string(),
  versions: z.array(AppVersionSchema),
  authors: z.array(AppAuthorSchema),
  tags: z.array(z.string()),
  coverImage: AppImageSchema.optional(),
  screenshots: z.array(AppImageSchema).optional().default([]),
  resources: z.array(AppResourceSchema).optional().default([]) // e.g. documentation, github, etc.
})

export const AppSchema = RawAppSchema.extend({
  repository: AppStoreRepositorySchema
})
export type App = z.infer<typeof AppSchema>

export const RawAppListSchema = z.object({
  apps: z.array(RawAppSchema)
})
