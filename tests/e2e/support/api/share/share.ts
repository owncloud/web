import join from 'join-path'
import convert from 'xml-js'
import _ from 'lodash/object'

import { checkResponseStatus, request } from '../http'
import { User } from '../../types'
import { shareRoles } from '../../objects/app-files/share/collaborator'

export const shareTypes: Readonly<{
  user: string
  group: string
  public: string
  federated: string
  space: string
}> = {
  user: '0',
  group: '1',
  public: '3',
  federated: '6',
  space: '7'
}

export const createShare = async ({
  user,
  path,
  shareWith,
  shareType,
  role,
  name,
  space_ref
}: {
  user: User
  path?: string
  shareType: string
  shareWith?: string
  role?: string
  name?: string
  space_ref?: string
}): Promise<void> => {
  const body = new URLSearchParams()
  body.append('path', path)
  body.append('shareWith', shareWith)
  body.append('shareType', shareTypes[shareType])
  body.append('role', shareRoles[role])
  body.append('name', name)
  if (space_ref) {
    body.append('space_ref', space_ref)
  }
  const response = await request({
    method: 'POST',
    path: join('ocs', 'v2.php', 'apps', 'files_sharing', 'api', 'v1', 'shares'),
    body: body,
    user: user
  })
  checkResponseStatus(response, 'Failed while creating share')
}

export const acceptShare = async ({ user, path }: { user: User; path: string }): Promise<void> => {
  const params = new URLSearchParams({
    include_tags: 'false',
    state: 'all',
    shared_with_me: 'true'
  })
  const shareId = await getShareId({ user, path, params: params.toString() })
  const response = await request({
    method: 'POST',
    path: join('ocs', 'v2.php', 'apps', 'files_sharing', 'api', 'v1', 'shares', 'pending', shareId),
    user: user
  })
  checkResponseStatus(response, 'Failed while accepting share')
}

const getShareId = async ({
  user,
  path,
  params = 'include_tags=false&state=all&shared_with_me=true'
}: {
  user: User
  path: string
  params?: string
}): Promise<string> => {
  const response = await request({
    method: 'GET',
    path: join('ocs', 'v2.php', 'apps', 'files_sharing', 'api', 'v1', 'shares', `?${params}`),
    user: user
  })
  checkResponseStatus(response, 'Failed while geting share id')
  const fileData = JSON.parse(convert.xml2json(await response.text(), { compact: true }))
  let elements = _.get(fileData, 'ocs.data.element')
  elements = elements instanceof Array ? elements : [elements]
  for (const element of elements) {
    const elementPath = element.path._text.split('/').pop()
    if (elementPath === path) {
      return element.id._text
    }
  }
}
