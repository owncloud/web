import { checkResponseStatus, request } from '../http'
import {User} from '../../types'
import join from 'join-path'
import { config } from '../../../config'

export const createSpace = async ({ spaceAdmin }: { spaceAdmin: User }): Promise<void> => {
    // create a space with this function
}
