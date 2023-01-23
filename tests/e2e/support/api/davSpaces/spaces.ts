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

const createFile = async ({
  user,
  pathToFile,
  content,
  webDavEndPathToRoot // the root of the WebDAV path. This is `spaces/<space-id>` for ocis or `files/<user>` for oC10
}: {
  user: User
  pathToFile: string
  content: string
  webDavEndPathToRoot: string
}): Promise<void> => {
  const response = await request({
    method: 'PUT',
    path: join('remote.php', 'dav', webDavEndPathToRoot, pathToFile),
    body: content,
    user: user,
    formatJson: false
  })

  checkResponseStatus(response, `Failed while uploading file '${pathToFile}' in personal space`)
}

export const uploadFileInPersonalSpace = async ({
  user,
  pathToFile,
  content
}: {
  user: User
  pathToFile: string
  content: string
}): Promise<void> => {
  // upload a file step is same for oc10 and ocis
  // so first need to determine the end path to make request
  const webDavEndPathToRoot = config.ocis
    ? 'spaces/' + (await getPersonalSpaceId({ user }))
    : 'files/' + user.id
  await createFile({ user, pathToFile, content, webDavEndPathToRoot })
}
