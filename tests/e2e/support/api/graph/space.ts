import { checkResponseStatus, request } from '../http'
import {Space, User} from '../../types'
import join from 'join-path'
import { config } from '../../../config'

export const createSpace = async ({ spaceAdmin, space }: { spaceAdmin: User, space: Space }): Promise<void> => {
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

    checkResponseStatus(response, 'Failed while creating a space project')
}
