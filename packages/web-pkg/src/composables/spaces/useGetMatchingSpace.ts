import {
  useCapabilitySpacesEnabled,
  useConfigurationManager,
  useRouteParam,
  useStore
} from 'web-pkg/src/composables'
import { Resource, SpaceResource } from 'web-client'
import { buildShareSpaceResource, isPersonalSpaceResource } from 'web-client/src/helpers'
import { computed, Ref, unref } from 'vue'
import { basename } from 'path'

type GetMatchingSpaceOptions = {
  space?: Ref<SpaceResource>
}

export const useGetMatchingSpace = (options?: GetMatchingSpaceOptions) => {
  const store = useStore()
  const configurationManager = useConfigurationManager()
  const spaces = computed(() => store.getters['runtime/spaces/spaces'])
  const driveAliasAndItem = useRouteParam('driveAliasAndItem')
  const hasSpaces = useCapabilitySpacesEnabled(store)

  const getInternalSpace = (storageId: string): SpaceResource => {
    return (
      unref(options?.space) ||
      unref(spaces).find((space) => space.id === storageId) ||
      (!unref(hasSpaces) && unref(spaces).find((s) => isPersonalSpaceResource(s)))
    )
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
        shareName: resource.shareRoot ? basename(resource.shareRoot) : resource.name,
        serverUrl: configurationManager.serverUrl
      })
    )
  }

  return {
    getInternalSpace,
    getMatchingSpace
  }
}
