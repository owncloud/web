import { checkResponseStatus, request } from './http'
import { User } from '../types'
import { URLSearchParams } from 'url'

const occ = async (user: User, command: string): Promise<void> => {
  const body = new URLSearchParams()
  body.append('command', command)

  const response = await request({
    method: 'POST',
    path: 'apps/testing/api/v1/occ',
    body: body,
    user,
    versionApi: 'v1.php'
  })

  checkResponseStatus(response, `Command "${command}" failed.`)
}

export const setLocking = async ({
  value,
  user
}: {
  value: boolean
  user: User
}): Promise<void> => {
  await occ(user, `config:system:set filelocking.enabled --value=${(!!value).toString()}`)
}

export const setShareFolder = async ({
  value,
  user
}: {
  value: string
  user: User
}): Promise<void> => {
  await occ(user, `config:system:set share_folder --value=${value}`)
}

export const disableShareAutoAccept = async ({
  action,
  user
}: {
  action: 'disable' | 'enable'
  user: User
}): Promise<void> => {
  await occ(
    user,
    `config:app:set core shareapi_auto_accept_share --value=${
      { disable: 'no', enable: 'yes' }[action]
    }`
  )
}
