import { User } from '../../types'
import { createUser as graphCreateUser, deleteUser as graphDeleteUser } from '../graph'
import { createUser as keycloakCreateUser, deleteUser as keycloakDeleteUser } from '../keycloak'
import { config } from '../../../config'

export const createUser = async ({ user, admin }: { user: User; admin: User }): Promise<User> => {
  if (config.keycloak) {
    return keycloakCreateUser({ user, admin })
  }
  return graphCreateUser({ user, admin })
}

export const deleteUser = async ({ user, admin }: { user: User; admin: User }): Promise<User> => {
  if (config.keycloak) {
    return keycloakDeleteUser({ user, admin })
  }
  return graphDeleteUser({ user, admin })
}
