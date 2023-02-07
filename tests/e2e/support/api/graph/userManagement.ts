import { checkResponseStatus, request } from '../http'
import { Group, Me, User } from '../../types'
import join from 'join-path'
import { config } from '../../../config'

export enum Roles {
  SpaceAdmin = '2aadd357-682c-406b-8874-293091995fdd',
  Admin = '71881883-1768-46bd-a24d-a356a2afdf7f',
  Guest = '38071a68-456a-4553-846a-fa67bf5596cc',
  User = 'd7beeea8-8ff4-406b-8fb6-ab2dd81e6b11'
}

export const me = async ({ user }: { user: User }): Promise<Me> => {
  const response = await request({
    method: 'GET',
    path: join('graph', 'v1.0', 'me'),
    user
  })

  return await response.json()
}

export const createUser = async ({ user, admin }: { user: User; admin: User }): Promise<User> => {
  const body = JSON.stringify({
    displayName: user.displayName,
    mail: user.email,
    onPremisesSamAccountName: user.id,
    passwordProfile: { password: user.password }
  })

  const response = await request({
    method: 'POST',
    path: join('graph', 'v1.0', 'users'),
    body,
    user: admin
  })

  checkResponseStatus(response, 'Failed while creating user')
  return user
}

export const deleteUser = async ({ user, admin }: { user: User; admin: User }): Promise<User> => {
  await request({
    method: 'DELETE',
    path: join('graph', 'v1.0', 'users', user.id),
    user: admin
  })

  return user
}

const getUserId = async ({ user, admin }: { user: User; admin: User }): Promise<string> => {
  let userId = ''
  const response = await request({
    method: 'GET',
    path: join('graph', 'v1.0', 'users', user.id),
    user: admin
  })
  if (response.ok) {
    userId = (await response.json()).id
  }
  return userId
}

export const createGroup = async ({
  group,
  admin
}: {
  group: Group
  admin: User
}): Promise<Group> => {
  const body = JSON.stringify({
    displayName: group.displayName
  })

  const response = await request({
    method: 'POST',
    path: join('graph', 'v1.0', 'groups'),
    body,
    user: admin
  })

  checkResponseStatus(response, 'Failed while creating group')
  return group
}

const getGroupId = async ({ group, admin }: { group: Group; admin: User }): Promise<string> => {
  let groupId = ''
  const response = await request({
    method: 'GET',
    path: join('graph', 'v1.0', 'groups', group.displayName),
    user: admin
  })
  if (response.ok) {
    groupId = (await response.json()).id
  }
  return groupId
}

export const deleteGroup = async ({
  group,
  admin
}: {
  group: Group
  admin: User
}): Promise<Group> => {
  const groupId = await getGroupId({ group, admin })
  await request({
    method: 'DELETE',
    path: join('graph', 'v1.0', 'groups', groupId),
    user: admin
  })
  return group
}

export const addUserToGroup = async ({
  user,
  group,
  admin
}: {
  user: User
  group: Group
  admin: User
}): Promise<void> => {
  const groupId = await getGroupId({ group, admin })
  const userId = await getUserId({ user, admin })
  const body = JSON.stringify({
    '@odata.id': join(config.backendUrl, 'graph', 'v1.0', 'users', userId)
  })

  const response = await request({
    method: 'POST',
    path: join('graph', 'v1.0', 'groups', groupId, 'members', '$ref'),
    body: body,
    user: admin
  })
  checkResponseStatus(response, 'Failed while adding an user to the group')
}

export const assignRole = async ({
  admin,
  id,
  role
}: {
  admin: User
  id: string
  role: Roles
}): Promise<void> => {
  const response = await request({
    method: 'POST',
    path: join('graph', 'v1.0', 'users', id, 'appRoleAssignments'),
    user: admin,
    body: JSON.stringify({
      principalId: id,
      appRoleId: role,
      resourceId: 'some-graph-app-id'
    })
  })
  checkResponseStatus(response, 'Failed while assigning role to the user')
}
