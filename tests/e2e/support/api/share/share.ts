import { checkResponseStatus, request } from '../http'
import { User } from '../../types'
import join from 'join-path'
export const createShare = async ({
  user,
  path,
  shareWith,
  shareType,
  role
}: {
  user: User
  path: string
  shareWith: string
  shareType: string
  role: string
}): Promise<void> => {
  const shareTypeToIntString = shareType === 'group' ? '1' : shareType === 'public link' ? '3' : '0'
  const body = new URLSearchParams()
  body.append('path', path)
  body.append('shareWith', shareWith)
  body.append('shareType', shareTypeToIntString)
  body.append('role', role)

  const response = await request({
    method: 'POST',
    path: join('ocs', 'v2.php', 'apps', 'files_sharing', 'api', 'v1', 'shares'),
    body: body,
    user: user
  })
  checkResponseStatus(response, 'Failed while creating share')
}
