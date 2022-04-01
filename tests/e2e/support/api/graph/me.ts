import { User } from '../../types'
import { request } from '../http'
import join from 'join-path'

interface Me {
  id: string
}

export const me = async ({ user }: { user: User }): Promise<Me> => {
  const response = await request({
    method: 'GET',
    path: join('graph', 'v1.0', 'me'),
    user
  })

  return await response.json()
}
