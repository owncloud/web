import { buildSharedResource } from '../resources'
import { ShareStatus } from './status'

export async function triggerShareAction(resource, status, allowReSharing, $client) {
  const method = _getRequestMethod(status)
  if (!method) {
    throw new Error('invalid new share status')
  }

  // exec share action
  let response = await $client.requests.ocs({
    service: 'apps/files_sharing',
    action: `api/v1/shares/pending/${resource.share.id}`,
    method
  })

  // exit on failure
  if (response.status !== 200) {
    throw new Error(response.statusText)
  }

  // get updated share from response and transform & return it
  if (parseInt(response.headers.get('content-length')) > 0) {
    response = await response.json()
    if (response.ocs.data.length > 0) {
      const share = response.ocs.data[0]
      return buildSharedResource(share, true, allowReSharing)
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
    default:
      return null
  }
}
