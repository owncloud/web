import { useStore } from '../store'
import { Store } from 'vuex'
import { computed, Ref, ref, unref, watch } from 'vue'
import {
  buildShareSpaceResource,
  ShareTypes,
  SpaceResource
} from '@ownclouders/web-client/src/helpers'
import { useRouteQuery } from '../router'
import { Resource } from '@ownclouders/web-client'
import { useSpacesLoading } from './useSpacesLoading'
import { queryItemAsString } from '../appDefaults'
import { urlJoin } from '@ownclouders/web-client/src/utils'
import { useCapabilitySpacesEnabled } from '../capability'
import { useClientService } from '../clientService'
import { useConfigurationManager } from '../configuration'

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

  const getSpaceByDriveAliasAndItem = (driveAliasAndItem: string) => {
    const driveAliasAndItemSegments = driveAliasAndItem.split('/')

    return unref(spaces).find((s) => {
      if (!driveAliasAndItem.startsWith(s.driveAlias)) {
        return false
      }

      const driveAliasSegments = s.driveAlias.split('/')
      if (
        driveAliasAndItemSegments.length < driveAliasSegments.length ||
        driveAliasAndItemSegments.slice(0, driveAliasSegments.length).join('/') !== s.driveAlias
      ) {
        return false
      }

      return s
    })
  }

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
      if (driveAliasAndItem.startsWith('public/')) {
        const [publicLinkToken, ...item] = driveAliasAndItem.split('/').slice(1)
        matchingSpace = unref(spaces).find((s) => s.id === publicLinkToken)
        path = item.join('/')
      } else if (
        driveAliasAndItem.startsWith('share/') ||
        driveAliasAndItem.startsWith('ocm-share/')
      ) {
        const [shareName, ...item] = driveAliasAndItem.split('/').slice(1)
        const driveAliasPrefix = driveAliasAndItem.startsWith('ocm-share/') ? 'ocm-share' : 'share'
        matchingSpace = buildShareSpaceResource({
          driveAliasPrefix,
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
        } else {
          matchingSpace = getSpaceByDriveAliasAndItem(driveAliasAndItem)
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

          matchingSpace = getSpaceByDriveAliasAndItem(driveAliasAndItem)
        }

        if (matchingSpace) {
          path = driveAliasAndItem.slice(matchingSpace.driveAlias.length)
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
      store.commit('runtime/spaces/SET_CURRENT_SPACE', s)
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
