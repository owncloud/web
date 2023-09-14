import { useStore } from '../store'
import { Store } from 'vuex'
import { computed, Ref, ref, unref, watch } from 'vue'
import {
  isMountPointSpaceResource,
  isPersonalSpaceResource,
  SpaceResource
} from 'web-client/src/helpers'
import { useRouteQuery } from '../router'
import { Resource } from 'web-client'
import { useSpacesLoading } from './useSpacesLoading'
import { queryItemAsString } from '../appDefaults'
import { urlJoin } from 'web-client/src/utils'
import { useCapabilitySpacesEnabled } from '../capability'
import { useClientService, useConfigurationManager } from 'web-pkg/src/composables'
import { AncestorMetaData } from 'web-pkg/src/types'
import { findPathToMountPoint } from 'web-pkg'

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
  const fileIdQueryItem = useRouteQuery('fileId')
  const fileId = computed(() => {
    return queryItemAsString(unref(fileIdQueryItem))
  })
  const hasSpaces = useCapabilitySpacesEnabled(store)
  const clientService = useClientService()
  const spaces = computed<SpaceResource[]>(() => store.getters['runtime/spaces/spaces'])
  const space = ref<SpaceResource>(null)
  const item: Ref<string> = ref(null)
  const loading = ref(false)
  const configurationManager = useConfigurationManager()

  const currentAncestorRequest = {
    spaceId: null,
    fileId: null,
    path: null
  }

  const loadAncestorMetaData = async ({
    space,
    fileId,
    path
  }: {
    space: SpaceResource
    fileId?: string
    path?: string
  }) => {
    if (
      currentAncestorRequest.spaceId === space.id &&
      ((currentAncestorRequest.fileId && currentAncestorRequest.fileId === fileId) ||
        currentAncestorRequest.path === path)
    ) {
      return
    }

    // TODO: cancel ongoing request

    loading.value = true

    currentAncestorRequest.spaceId = space.id
    currentAncestorRequest.fileId = fileId
    currentAncestorRequest.path = item

    await store.dispatch('runtime/ancestorMetaData/loadAncestorMetaData', {
      space: space,
      client: clientService.webdav,
      fileId,
      path,
      fullShareOwnerPaths: configurationManager.options.routing.fullShareOwnerPaths
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
        const path = urlJoin(driveAliasAndItem.slice(unref(space).driveAlias.length), {
          leadingSlash: true
        })
        await loadAncestorMetaData({ space: unref(space), fileId: unref(fileId), path })
        item.value = path
        loading.value = false
        return
      }

      let matchingSpace = null
      let path = null
      const driveAliasAndItemSegments = driveAliasAndItem.split('/')
      if (driveAliasAndItem.startsWith('public/')) {
        const [publicLinkToken, ...item] = driveAliasAndItem.split('/').slice(1)
        matchingSpace = unref(spaces).find((s) => s.id === publicLinkToken)
        path = item.join('/')
      } else {
        if (unref(hasSpaces) && unref(fileId)) {
          matchingSpace = unref(spaces).find((s) => {
            return unref(fileId).startsWith(`${s.fileId}`)
          })
        }

        if (!matchingSpace) {
          if (!store.state.runtime.spaces.mountPointsInitialized) {
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
          loading.value = true

          if (
            isPersonalSpaceResource(matchingSpace) &&
            matchingSpace.ownerId !== store.getters.user.uuid &&
            !configurationManager.options.routing.fullShareOwnerPaths
          ) {
            await loadAncestorMetaData({ space: matchingSpace, fileId: unref(fileId) })
            const { mountPoint } = findPathToMountPoint(store, unref(fileId))
            path = driveAliasAndItem.slice(matchingSpace.driveAlias.length)
            path = `${urlJoin(mountPoint.root.remoteItem.path, path.split('/').slice(3).join('/'))}`
          } else {
            path = driveAliasAndItem.slice(matchingSpace.driveAlias.length)
            await loadAncestorMetaData({ space: matchingSpace, fileId: unref(fileId), path })
          }
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
