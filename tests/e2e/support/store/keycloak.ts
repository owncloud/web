import {Group, KeycloakRealmRole, User} from '../types'

export const keycloakRealmRoles = new Map<string, KeycloakRealmRole>()
export const keycloakCreatedUser = new Map<string, User>()
export const keycloakCreatedGroup = new Map<string, Group>()
