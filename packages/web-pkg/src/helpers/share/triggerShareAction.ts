import { Resource, SpaceResource } from '@ownclouders/web-client/src'
import { aggregateResourceShares, ShareStatus } from '@ownclouders/web-client/src/helpers/share'
import { HttpError } from '@ownclouders/web-client/src/errors'
import { OwnCloudSdk } from '@ownclouders/web-client/src/types'

export async function triggerShareAction({
  resource,
  status,
  hide = false,
  hasResharing,
  hasShareJail,
  client,
  spaces = [],
  fullShareOwnerPaths = false
}: {
  resource: Resource
  status: ShareStatus
  hide?: boolean
  hasResharing: boolean
  hasShareJail: boolean
  client: OwnCloudSdk
  spaces?: SpaceResource[]
  fullShareOwnerPaths?: boolean
}) {
  const method = _getRequestMethod(status)
  if (!method) {
    throw new Error('invalid new share status')
  }

  // exec share action
  let response = await client.requests.ocs({
    service: 'apps/files_sharing',
    action: `api/v1/shares/pending/${resource.share.id}?hide=${hide ? 'true' : 'false'}`,
    method
  })

  // exit on failure
  if (response.status !== 200) {
    throw new HttpError(response.statusText, response)
  }

  // get updated share from response and transform & return it
  if (parseInt(response.headers.get('content-length')) > 0) {
    response = await response.json()
    if ((response as any).ocs.data.length > 0) {
      const share = (response as any).ocs.data[0]
      return aggregateResourceShares({
        shares: [share],
        spaces,
        incomingShares: true,
        allowSharePermission: hasResharing,
        hasShareJail,
        fullShareOwnerPaths
      })[0]
    }
  }

  return null
}

function _getRequestMethod(status) {
  switch (status) {
    case ShareStatus.accepted:
      return 'POST'
    case ShareStatus.declined:
      return 'DELETE'
    case ShareStatus.pending:
      return 'POST'
    default:
      return null
  }
}
