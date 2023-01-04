import { checkResponseStatus, request } from '../http'
import { User } from '../../types'
import join from 'join-path'
import { getPersonalSpaceId } from '../graph'
import { config } from '../../../config'

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
    const oc10Path = join('remote.php', 'dav', 'files', user.id, subFolder, resource)

    const response = await request({
      method: 'MKCOL',
      path: config.ocis
        ? join(
            'remote.php',
            'dav',
            'spaces',
            await getPersonalSpaceId({ user }),
            subFolder,
            resource
          )
        : oc10Path,
      user: user,
      formatJson: false
    })

    checkResponseStatus(response, 'Failed while creating folder')
    subFolder += resource
  }
}
