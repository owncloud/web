import join from 'join-path'

import { checkResponseStatus, request } from '../http'
import { User } from '../../types'

export const configureAutoAcceptShare = async ({
  user,
  state
}: {
  user: User
  state: boolean
}): Promise<void> => {
  const body = JSON.stringify({
    value: {
      accountUuid: 'me',
      bundleId: '2a506de7-99bd-4f0d-994e-c38e72c28fd9',
      settingId: 'ec3ed4a3-3946-4efc-8f9f-76d38b12d3a9',
      resource: {
        type: 'TYPE_USER'
      },
      boolValue: state
    }
  })
  const response = await request({
    method: 'POST',
    path: join('api', 'v0', 'settings', 'values-save'),
    body: body,
    user: user
  })
  checkResponseStatus(response, 'Failed while disabling auto-accept share')
}
