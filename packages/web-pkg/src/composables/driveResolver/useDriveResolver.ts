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
import { useClientService } from 'web-pkg/src/composables'
import { AncestorMetaData } from 'web-pkg/src/types'

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

  const findMatchingMountPoint = (id: string | number): SpaceResource => {
    return store.getters['runtime/spaces/spaces'].find(
      (space) => isMountPointSpaceResource(space) && space.root?.remoteItem?.id === id
    )
  }

  const ancestorMetaData = computed<AncestorMetaData>(
    () => store.getters['runtime/ancestorMetaData/ancestorMetaData']
  )

  const findMountPoint = (fileId: Resource['id']) => {
    let mountPoint = findMatchingMountPoint(fileId)
    let resource = unref(ancestorMetaData)[fileId]
    const sharePathSegments = mountPoint ? [] : [unref(resource).name]
    while (!mountPoint) {
      resource = unref(ancestorMetaData)[resource.parentFolderId]
      mountPoint = findMatchingMountPoint(resource.id)
      if (!mountPoint) {
        sharePathSegments.unshift(resource.name)
      }
    }

    return mountPoint
  }

  const currentAncestorRequest = {
    spaceId: null,
    fileId: null
  }

  watch(
    [options.driveAliasAndItem, areSpacesLoading],
    async ([driveAliasAndItem]) => {
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
            matchingSpace.ownerId !== store.getters.user.uuid
          ) {
            if (
              currentAncestorRequest.fileId === unref(fileId) &&
              currentAncestorRequest.spaceId === matchingSpace.id
            ) {
              return
            }
            currentAncestorRequest.fileId = unref(fileId)
            currentAncestorRequest.spaceId = matchingSpace.id
            await store.dispatch('runtime/ancestorMetaData/loadAncestorMetaData', {
              space: matchingSpace,
              client: clientService.webdav,
              fileId: unref(fileId)
            })
            const mountPoint = findMountPoint(unref(fileId))
            path = driveAliasAndItem.slice(matchingSpace.driveAlias.length)
            path = `${urlJoin(mountPoint.root.remoteItem.path, path.split('/').slice(3).join('/'))}`
          } else {
            path = driveAliasAndItem.slice(matchingSpace.driveAlias.length)
            await store.dispatch('runtime/ancestorMetaData/loadAncestorMetaData', {
              path,
              space: matchingSpace,
              client: clientService.webdav,
              fileId: unref(fileId)
            })
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
