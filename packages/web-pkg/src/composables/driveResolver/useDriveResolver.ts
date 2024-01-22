import { computed, Ref, ref, unref, watch } from 'vue'
import { buildShareSpaceResource, SpaceResource } from '@ownclouders/web-client/src/helpers'
import { useRouteQuery } from '../router'
import { useSpacesLoading } from './useSpacesLoading'
import { queryItemAsString } from '../appDefaults'
import { urlJoin } from '@ownclouders/web-client/src/utils'
import { useClientService } from '../clientService'
import { useSpacesStore, useCapabilityStore, useConfigStore } from '../piniaStores'

interface DriveResolverOptions {
  driveAliasAndItem?: Ref<string>
}

interface DriveResolverResult {
  space: Ref<SpaceResource>
  item: Ref<string>
  itemId: Ref<string>
  loading: Ref<boolean>
}

export const useDriveResolver = (options: DriveResolverOptions = {}): DriveResolverResult => {
  const spacesStore = useSpacesStore()
  const capabilityStore = useCapabilityStore()
  const { areSpacesLoading } = useSpacesLoading()
  const shareId = useRouteQuery('shareId')
  const fileIdQueryItem = useRouteQuery('fileId')
  const fileId = computed(() => {
    return queryItemAsString(unref(fileIdQueryItem))
  })
  const configStore = useConfigStore()

  const clientService = useClientService()
  const spaces = computed(() => spacesStore.spaces)
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
      if (driveAliasAndItem.startsWith('public/') || driveAliasAndItem.startsWith('ocm/')) {
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
          serverUrl: configStore.serverUrl
        })
        path = item.join('/')
      } else {
        if (capabilityStore.spacesEnabled && unref(fileId)) {
          matchingSpace = unref(spaces).find((s) => {
            return unref(fileId).startsWith(`${s.fileId}`)
          })
        } else {
          matchingSpace = getSpaceByDriveAliasAndItem(driveAliasAndItem)
        }

        if (!matchingSpace) {
          if (
            !spacesStore.mountPointsInitialized &&
            configStore.options.routing.fullShareOwnerPaths
          ) {
            loading.value = true
            await spacesStore.loadMountPoints({ graphClient: clientService.graphAuthenticated })
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
    (s: SpaceResource) => {
      spacesStore.setCurrentSpace(s)
      if (!s || ['public', 'share', 'personal', 'mountpoint'].includes(s.driveType)) {
        return
      }
      spacesStore.loadSpaceMembers({ graphClient: clientService.graphAuthenticated, space: s })
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
