import join from 'join-path'

import { checkResponseStatus, request } from '../http'
import { User } from '../../types'

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

export const shareRoles: Readonly<{
  'Invited people': string
  'Can upload': string
  'Can manage': string
  'Can edit': string
  'Can view': string
  'Secret File Drop': string
}> = {
  'Invited people': 'internal',
  'Can upload': 'contributor',
  'Can manage': 'manager',
  'Can edit': 'editor',
  'Can view': 'viewer',
  'Secret File Drop': 'uploader'
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
