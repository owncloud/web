import { Cookie, Token } from '../types'

export const createdTokenStore = new Map<string, Token>()
export const createdKeycloakAccessTokenStore = new Map<string, Token>()
export const createdKeycloakRefreshTokenStore = new Map<string, Token>()
export const keycloakCookieStore = new Map<string, Cookie>()

