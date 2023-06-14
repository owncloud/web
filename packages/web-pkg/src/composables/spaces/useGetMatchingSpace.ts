import { useConfigurationManager, useStore } from 'web-pkg/src/composables'
import { Resource, SpaceResource } from 'web-client'
import { buildShareSpaceResource } from 'web-client/src/helpers'

export const useGetMatchingSpace = () => {
  const store = useStore()
  const configurationManager = useConfigurationManager()
  const spaces = store.getters['runtime/spaces/spaces']

  const getInternalSpace = (storageId) => {
    return spaces.find((space) => space.id === storageId)
  }

  const getMatchingSpace = (resource: Resource): SpaceResource => {
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
