import { checkResponseStatus, request } from '../http'
import { User } from '../../types'
import join from 'join-path'
import { getPersonalSpaceId } from '../graph'
import { config } from '../../../config'

export const folderExists = async ({
  user,
  path
}: {
  user: User
  path: string
}): Promise<boolean> => {
  const getResponse = await request({
    method: 'GET',
    path,
    user: user
  })

  return getResponse.status === 200
}

export const createFolder = async ({
  user,
  folder
}: {
  user: User
  folder: string
}): Promise<void> => {
  const paths = folder.split('/')

  let parentFolder = ''
  for (const resource of paths) {
    const path = join(
      'remote.php',
      'dav',
      config.ocis ? 'spaces/' + (await getPersonalSpaceId({ user })) : 'files/' + user.id,
      parentFolder,
      resource
    )
    // check if the folder exists already or not
    const folderExist = await folderExists({ user, path })
    if (folderExist === false) {
      const response = await request({
        method: 'MKCOL',
        path,
        user: user
      })
      checkResponseStatus(response, 'Failed while creating folder')
    }
    parentFolder = join(parentFolder, resource)
  }
}
