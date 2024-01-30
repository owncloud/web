import { ShareResource } from '@ownclouders/web-client/src/helpers/share'
import { HttpError } from '@ownclouders/web-client/src/errors'
import { OwnCloudSdk } from '@ownclouders/web-client/src/types'

/** @deprecated */
export async function triggerShareAction({
  resource,
  status,
  client,
  hidden = undefined
}: {
  resource: ShareResource
  status: number
  client: OwnCloudSdk
  hidden?: boolean
}) {
  const method = _getRequestMethod(status, hidden)
  if (!method) {
    throw new Error('invalid new share status')
  }

  let action = `api/v1/shares/pending/${resource.shareId}`
  if (hidden !== undefined) {
    action += `?hidden=${hidden ? 'true' : 'false'}`
  }

  // exec share action
  const response = await client.requests.ocs({ service: 'apps/files_sharing', action, method })

  // exit on failure
  if (response.status !== 200) {
    throw new HttpError(response.statusText, response)
  }

  return null
}

function _getRequestMethod(status: number, hidden: boolean) {
  if (hidden !== undefined) {
    // setting the hidden state is always done via PUT
    return 'PUT'
  }
  switch (status) {
    case 0:
      return 'POST'
    case 2:
      return 'DELETE'
    case 1:
      return 'POST'
    default:
      return null
  }
}
