import { checkResponseStatus, request } from '../http'
import { User } from '../../types'
import join from 'join-path'
import { getPersonalSpaceId } from '../graph'

export const createFolder = async ({
  user,
  folder
}: {
  user: User
  folder: string
}): Promise<void> => {
  const paths = folder.split('/')

  let subFolder = ''
  for (const resource of paths) {
    const response = await request({
      method: 'MKCOL',
      path: join(
        'remote.php',
        'dav',
        'spaces',
        await getPersonalSpaceId({ user }),
        subFolder,
        resource
      ),
      user: user
    })

    checkResponseStatus(response, 'Failed while creating folder')
    subFolder += resource
  }
}
