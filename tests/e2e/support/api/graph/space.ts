import { checkResponseStatus, request } from '../http'
import { Space, User } from '../../types'
import join from 'join-path'

export const createSpace = async ({
  spaceAdmin,
  space
}: {
  spaceAdmin: User
  space: Space
}): Promise<string> => {
  // create a space with this function
  const body = JSON.stringify({
    id: space.id,
    name: space.name
  })

  const response = await request({
    method: 'POST',
    path: join('graph', 'v1.0', 'drives'),
    body,
    user: spaceAdmin
  })

  try {
    checkResponseStatus(response, 'Failed while creating a space project')
    const result = await response.json()
    return result.id
  } catch (err) {
    throw new Error(err.message)
  }
}
