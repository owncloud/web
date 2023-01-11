import { checkResponseStatus, request } from '../http'
import { User } from '../../types'
import join from 'join-path'
import { getPersonalSpaceId } from '../graph'
import { config } from '../../../config'

export const doesFolderExists = async ({
  user,
  parentFolder,
  subFolder,
  oc10Path
}: {
  user: User
  parentFolder: string
  subFolder: string
  oc10Path: string
}): Promise<boolean> => {
  const getResponse = await request({
    method: 'GET',
    path: config.ocis
      ? join(
          'remote.php',
          'dav',
          'spaces',
          await getPersonalSpaceId({ user }),
          parentFolder,
          subFolder
        )
      : oc10Path,
    user: user,
    formatJson: false
  })

  return getResponse.status !== 404
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
    const oc10Path = join('remote.php', 'dav', 'files', user.id, parentFolder, resource)
    // check if the folder exists already or not
    const folderExists = await doesFolderExists({
      user,
      parentFolder,
      subFolder: resource,
      oc10Path
    })
    if (folderExists === false) {
      const response = await request({
        method: 'MKCOL',
        path: config.ocis
          ? join(
              'remote.php',
              'dav',
              'spaces',
              await getPersonalSpaceId({ user }),
              parentFolder,
              resource
            )
          : oc10Path,
        user: user,
        formatJson: false
      })
      checkResponseStatus(response, 'Failed while creating folder')
    } else {
      parentFolder = join(parentFolder, resource)
      continue
    }

    parentFolder = join(parentFolder, resource)
  }
}
