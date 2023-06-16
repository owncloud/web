import { useConfigurationManager, useStore } from 'web-pkg/src/composables'
import { Resource, SpaceResource } from 'web-client'
import { buildPublicSpaceResource, buildShareSpaceResource } from 'web-client/src/helpers'
import { useGettext } from 'vue3-gettext'

export const useGetMatchingSpace = () => {
  const store = useStore()
  const configurationManager = useConfigurationManager()
  const spaces = store.getters['runtime/spaces/spaces']
  const { $gettext } = useGettext()
  const getInternalSpace = (storageId) => {
    return spaces.find((space) => space.id === storageId)
  }

  const getMatchingSpace = (resource: Resource): SpaceResource => {
    if (resource.downloadURL.split('/')?.[5] === 'public-files') {
      return buildPublicSpaceResource({
        id: store.getters['runtime/auth/publicLinkToken'],
        name: $gettext('Public files'),
        ...(store.getters['runtime/auth/publicLinkPassword'] && {
          publicLinkPassword: store.getters['runtime/auth/publicLinkPassword']
        }),
        serverUrl: configurationManager.serverUrl
      })
    }

    return (
      getInternalSpace(resource.storageId) ||
      buildShareSpaceResource({
        shareId: resource.shareId,
        shareName: resource.name,
        serverUrl: configurationManager.serverUrl
      })
    )
  }

  return {
    getInternalSpace,
    getMatchingSpace
  }
}
