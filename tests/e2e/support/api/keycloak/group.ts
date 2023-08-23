import { getUserIdFromResponse, request, realmBasePath } from './utils'
import { checkResponseStatus } from '../http'
import { Group, User } from '../../types'
import join from 'join-path'
import { UsersEnvironment } from '../../environment'

export const createGroup = async ({
  group,
  admin
}: {
  group: Group
  admin: User
}): Promise<Group> => {
  const body = JSON.stringify({
    name: group.displayName
  })

  // create a group
  const response = await request({
    method: 'POST',
    path: join(realmBasePath, 'groups'),
    body,
    user: admin,
    header: { 'Content-Type': 'application/json' }
  })
  checkResponseStatus(response, 'Failed while creating group')

  const usersEnvironment = new UsersEnvironment()
  usersEnvironment.storeCreatedGroup({ group: { ...group, uuid: getUserIdFromResponse(response) } })
  return group
}
