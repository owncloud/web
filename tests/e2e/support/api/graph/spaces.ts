import { checkResponseStatus, request } from '../http'
import { Space, User } from '../../types'
import join from 'join-path'

export const getPersonalSpaceId = async ({ user }: { user: User }): Promise<string> => {
  const response = await request({
    method: 'GET',
    path: join('graph', 'v1.0', 'me', 'drives', "?$filter=driveType eq 'personal'"),
    user: user
  })

  checkResponseStatus(response, 'Failed while geting personal space')
  
  const result = await response.json()
  return result.value[0].id
}