import { User } from '../types'
import { request } from './http'
import join from 'join-path'

export enum Roles {
  SpaceAdmin = '2aadd357-682c-406b-8874-293091995fdd'
}

export const assignRole = async ({
  id,
  admin,
  role
}: {
  admin: User
  id: string
  role: Roles
}): Promise<void> => {
  await request({
    method: 'POST',
    path: join('api', 'v0', 'settings', 'assignments-add'),
    user: admin,
    body: JSON.stringify({
      account_uuid: id,
      role_id: role
    })
  })
}
