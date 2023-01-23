import { useStore } from '../store'
import { Store } from 'vuex'
import { computed, Ref, ref, unref, watch } from 'vue'
import { buildShareSpaceResource, SpaceResource } from 'web-client/src/helpers'
import { useRouteQuery } from '../router'
import { useGraphClient } from '../graphClient'
import { Resource } from 'web-client'
import { useSpacesLoading } from './useSpacesLoading'
import { queryItemAsString } from '../appDefaults'
import { configurationManager } from '../../configuration'
import { urlJoin } from 'web-client/src/utils'
import { useCapabilitySpacesEnabled } from '../capability'

interface DriveResolverOptions {
  store?: Store<any>
  driveAliasAndItem?: Ref<string>
}

interface DriveResolverResult {
  space: Ref<SpaceResource>
  item: Ref<string>
  itemId: Ref<string>
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

  const { graphClient } = useGraphClient({ store })
  const spaces = computed<SpaceResource[]>(() => store.getters['runtime/spaces/spaces'])
  const space = ref<SpaceResource>(null)
  const item: Ref<string> = ref(null)

  watch(
    [options.driveAliasAndItem, areSpacesLoading],
    ([driveAliasAndItem]) => {
      if (!driveAliasAndItem) {
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
        } else {
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
        }
      }
      space.value = matchingSpace
      item.value = urlJoin(path, {
        leadingSlash: true
      })
    },
    { immediate: true, deep: true }
  )
  watch(
    space,
    (s: Resource) => {
      if (!s || ['public', 'share', 'personal'].includes(s.driveType)) {
        return
      }
      return store.dispatch('runtime/spaces/loadSpaceMembers', {
        graphClient: unref(graphClient),
        space: s
      })
    },
    { immediate: true }
  )
  return {
    space,
    item,
    itemId: fileId
  }
}
