import { User } from '../../types'
import { checkResponseStatus, request } from '../http'
import join from 'join-path'

interface ApplicationEntity {
  appRoles: AppRole[]
  displayName: string
  id: string
}

interface AppRole {
  displayName: string
  id: string
}

export const getApplicationEntity = async (admin: User): Promise<ApplicationEntity> => {
  const response = await request({
    method: 'GET',
    path: join('graph', 'v1.0', 'applications'),
    user: admin
  })
  checkResponseStatus(response, 'Failed while getting application id')
  return (await response.json()).value[0]
}
