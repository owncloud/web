import { useStore } from '../store'
import { Store } from 'vuex'
import { computed, Ref, ref, unref, watch } from 'vue'
import { buildShareSpaceResource, SpaceResource } from 'web-client/src/helpers'
import { useRouteQuery } from '../router'
import { Resource } from 'web-client'
import { useSpacesLoading } from './useSpacesLoading'
import { queryItemAsString } from '../appDefaults'
import { urlJoin } from 'web-client/src/utils'
import { useCapabilitySpacesEnabled } from '../capability'
import { useClientService, useConfigurationManager } from 'web-pkg/src/composables'

interface DriveResolverOptions {
  store?: Store<any>
  driveAliasAndItem?: Ref<string>
}

interface DriveResolverResult {
  space: Ref<SpaceResource>
  item: Ref<string>
  itemId: Ref<string>
  loading: Ref<boolean>
}

export const useDriveResolver = (options: DriveResolverOptions = {}): DriveResolverResult => {
  const store = options.store || useStore()
  const { areSpacesLoading } = useSpacesLoading({ store })
  const shareId = useRouteQuery('shareId')
  const fileIdQueryItem = useRouteQuery('fileId')
  const fileId = computed(() => {
    return queryItemAsString(unref(fileIdQueryItem))
  })
  const hasSpaces = useCapabilitySpacesEnabled(store)
  const configurationManager = useConfigurationManager()

  const clientService = useClientService()
  const spaces = computed<SpaceResource[]>(() => store.getters['runtime/spaces/spaces'])
  const space = ref<SpaceResource>(null)
  const item: Ref<string> = ref(null)
  const loading = ref(false)

  watch(
    [options.driveAliasAndItem, areSpacesLoading],
    async ([driveAliasAndItem, areSpacesLoading], [driveAliasAndItemOld, areSpacesLoadingOld]) => {
      if (driveAliasAndItem === driveAliasAndItemOld && areSpacesLoading === areSpacesLoadingOld) {
        return
      }

      if (!driveAliasAndItem || driveAliasAndItem.startsWith('virtual/')) {
        space.value = null
        item.value = null
        return
      }

      const isOnlyItemPathChanged =
        unref(space) && driveAliasAndItem.startsWith(unref(space).driveAlias)
      if (isOnlyItemPathChanged) {
        item.value = urlJoin(driveAliasAndItem.slice(unref(space).driveAlias.length), {
          leadingSlash: true
        })
        return
      }

      let matchingSpace = null
      let path = null
      const driveAliasAndItemSegments = driveAliasAndItem.split('/')
      if (driveAliasAndItem.startsWith('public/')) {
        const [publicLinkToken, ...item] = driveAliasAndItem.split('/').slice(1)
        matchingSpace = unref(spaces).find((s) => s.id === publicLinkToken)
        path = item.join('/')
      } else if (driveAliasAndItem.startsWith('share/')) {
        const [shareName, ...item] = driveAliasAndItem.split('/').slice(1)
        matchingSpace = buildShareSpaceResource({
          shareId: queryItemAsString(unref(shareId)),
          shareName: unref(shareName),
          serverUrl: configurationManager.serverUrl
        })
        path = item.join('/')
      } else {
        if (unref(hasSpaces) && unref(fileId)) {
          matchingSpace = unref(spaces).find((s) => {
            return unref(fileId).startsWith(`${s.fileId}`)
          })
        }

        if (!matchingSpace) {
          if (
            !store.state.runtime.spaces.mountPointsInitialized &&
            configurationManager.options.routing.fullShareOwnerPaths
          ) {
            loading.value = true
            await store.dispatch('runtime/spaces/loadMountPoints', {
              graphClient: clientService.graphAuthenticated
            })
          }

          matchingSpace = unref(spaces).find((s) => {
            if (!driveAliasAndItem.startsWith(s.driveAlias)) {
              return false
            }

            const driveAliasSegments = s.driveAlias.split('/')
            if (
              driveAliasAndItemSegments.length < driveAliasSegments.length ||
              driveAliasAndItemSegments.slice(0, driveAliasSegments.length).join('/') !==
                s.driveAlias
            ) {
              return false
            }

            return s
          })
        }

        if (matchingSpace) {
          path = driveAliasAndItem.slice(matchingSpace.driveAlias.length)
          console.log('######', path, matchingSpace.driveAlias)
        }
      }
      space.value = matchingSpace
      item.value = urlJoin(path, {
        leadingSlash: true
      })
      loading.value = false
    },
    { immediate: true, deep: true }
  )
  watch(
    space,
    (s: Resource) => {
      if (!s || ['public', 'share', 'personal', 'mountpoint'].includes(s.driveType)) {
        return
      }
      return store.dispatch('runtime/spaces/loadSpaceMembers', {
        graphClient: clientService.graphAuthenticated,
        space: s
      })
    },
    { immediate: true }
  )
  return {
    space,
    item,
    itemId: fileId,
    loading
  }
}
