import { z } from 'zod'

// Invite
export const inviteSchema = z.object({
  token: z.string(),
  expiration: z.number().optional(),
  description: z.string().optional(),
  invite_link: z.string().optional()
})
export type InviteSchema = z.infer<typeof inviteSchema>

export const inviteListSchema = z.array(inviteSchema)
export type InviteListSchema = z.infer<typeof inviteListSchema>

// Provider
export const providerSchema = z.object({
  domain: z.string(),
  full_name: z.string()
})
export type ProviderSchema = z.infer<typeof providerSchema>

export const providerListSchema = z.array(providerSchema)
export type ProviderListSchema = z.infer<typeof providerListSchema>
