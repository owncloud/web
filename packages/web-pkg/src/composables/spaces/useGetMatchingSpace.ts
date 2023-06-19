import {
  useCapabilitySpacesEnabled,
  useConfigurationManager,
  useRouteParam,
  useStore
} from 'web-pkg/src/composables'
import { Resource, SpaceResource } from 'web-client'
import { buildShareSpaceResource, isPersonalSpaceResource } from 'web-client/src/helpers'
import { Ref, unref } from 'vue'

type GetMatchingSpaceOptions = {
  space?: Ref<SpaceResource>
}

export const useGetMatchingSpace = (options?: GetMatchingSpaceOptions) => {
  const store = useStore()
  const configurationManager = useConfigurationManager()
  const spaces = store.getters['runtime/spaces/spaces']
  const driveAliasAndItem = useRouteParam('driveAliasAndItem')
  const hasSpaces = useCapabilitySpacesEnabled(store)

  const getInternalSpace = (storageId) => {
    if (!unref(hasSpaces)) {
      return spaces.find((s) => isPersonalSpaceResource(s))
    }
    return unref(options?.space) || spaces.find((space) => space.id === storageId)
  }

  const getMatchingSpace = (resource: Resource): SpaceResource => {
    let storageId = resource.storageId
    if (unref(driveAliasAndItem)?.startsWith('public/')) {
      storageId = unref(driveAliasAndItem).split('/')[1]
    }

    return (
      getInternalSpace(storageId) ||
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
