import { checkResponseStatus, request } from './http'
import { User } from '../types'
import { URLSearchParams } from 'url'

export const setReceivedFolder = async ({
  folder,
  admin
}: {
  folder: string
  admin: User
}): Promise<void> => {
  const body = new URLSearchParams()
  body.append('command', `config:system:set share_folder --value=${folder}`)

  const response = await request({
    method: 'POST',
    path: 'apps/testing/api/v1/occ',
    body: body,
    user: admin,
    versionApi: 'v1.php'
  })

  checkResponseStatus(response, 'Failed creating received folder')
}

export const disablesAutoAccept = async ({ admin }: { admin: User }): Promise<void> => {
  const body = new URLSearchParams()
  body.append('command', 'config:app:set core shareapi_auto_accept_share --value=no')

  const response = await request({
    method: 'POST',
    path: 'apps/testing/api/v1/occ',
    body: body,
    user: admin,
    versionApi: 'v1.php'
  })

  checkResponseStatus(response, 'to disable auto accept was failed')
}
