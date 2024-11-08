import {Group, User} from '../../types'
import {
  createUser as graphCreateUser,
  deleteUser as graphDeleteUser,
  assignRole as graphAssignRole,
  createGroup as graphCreateGroup,
  deleteGroup as graphDeleteGroup,
  getUserId
} from '../graph'
import {
  createUser as keycloakCreateUser,
  deleteUser as keycloakDeleteUser,
  assignRole as keycloakAssignRole,
  unAssignRole as keycloakUnAssignRole,
  createGroup as keycloakCreateGroup,
  deleteGroup as keycloakDeleteGroup,
} from '../keycloak'
import { config } from '../../../config'
import { UsersEnvironment } from '../../environment'
import {checkResponseStatus, request} from "../http";
import join from "join-path";

export const createUser = async ({ user, admin }: { user: User; admin: User }): Promise<User> => {
  if (config.keycloak) {
    return await keycloakCreateUser({ user, admin })
  }
  return await graphCreateUser({ user, admin })
}

export const deleteUser = async ({ user, admin }: { user: User; admin: User }): Promise<User> => {
  if (config.keycloak) {
    return await keycloakDeleteUser({ user, admin })
  }
  return await graphDeleteUser({ user, admin })
}

export const assignRole = async ({
  admin,
  user,
  role
}: {
  admin: User
  user: User
  role: string
}): Promise<void> => {
  if (config.keycloak) {
    const usersEnvironment = new UsersEnvironment()
    const createdUser = usersEnvironment.getCreatedKeycloakUser({ key: user.id })
    await keycloakAssignRole({ admin, uuid: createdUser.uuid, role })
  } else {
    const id = await getUserId({ user, admin })
    await graphAssignRole(admin, id, role)
  }
}

export const unAssignRole = async ({ admin, user }: { admin: User; user: User }): Promise<void> => {
  if (config.keycloak) {
    const usersEnvironment = new UsersEnvironment()
    const createdUser = usersEnvironment.getCreatedKeycloakUser({ key: user.id })
    await keycloakUnAssignRole({ admin, uuid: createdUser.uuid, role: createdUser.role })
  }
}

export const createGroup = async ({ group, admin }: { group: Group; admin: User }): Promise<Group> => {
  if (config.keycloak) {
    return await keycloakCreateGroup({ group, admin })
  }
  return await graphCreateGroup({ group, admin })
}

// export const deleteGroup = async ({ group, admin }: { group: Group; admin: User }): Promise<Group> => {
//   if (config.keycloak) {
//     return await keycloakDeleteGroup({ group, admin })
//   }
//   return await graphDeleteGroup({ group, admin })
// }
