import { User } from '../../types'
import {
  createUser as graphCreateUser,
  deleteUser as graphDeleteUser,
  assignRole as graphAssignRole,
  getUserId
} from '../graph'
import {
  createUser as keycloakCreateUser,
  deleteUser as keycloakDeleteUser,
  assignRole as keycloakAssignRole
} from '../keycloak'
import { config } from '../../../config'
import { UsersEnvironment } from '../../environment'

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

export const assignRole = async ({ admin, user, role }): Promise<void> => {
  if (config.keycloak) {
    const usersEnvironment = new UsersEnvironment()
    const createdUser = usersEnvironment.getCreatedUser({ key: user.id })
    await keycloakAssignRole({ admin, uuid: createdUser.uuid, role })
  } else {
    const id = await getUserId({ user, admin })
    await graphAssignRole(admin, id, role)
  }
}
