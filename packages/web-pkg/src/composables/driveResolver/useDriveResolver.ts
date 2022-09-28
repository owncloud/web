import { useStore } from '../store'
import { Store } from 'vuex'
import { computed, Ref, ref, unref, watch } from '@vue/composition-api'
import { buildShareSpaceResource, SpaceResource } from 'web-client/src/helpers'
import { useRouteQuery } from '../router'
import { useGraphClient } from 'web-client/src/composables'
import { Resource } from 'web-client'
import { useSpacesLoading } from './useSpacesLoading'
import { queryItemAsString } from '../appDefaults'
import { configurationManager } from '../../configuration'
import { urlJoin } from 'web-pkg/src/utils'

interface DriveResolverOptions {
  store?: Store<any>
  driveAliasAndItem?: Ref<string>
}

export const useDriveResolver = (options: DriveResolverOptions = {}) => {
  const store = options.store || useStore()
  const { areSpacesLoading } = useSpacesLoading({ store })
  const shareId = useRouteQuery('shareId')
  const { graphClient } = useGraphClient({ store })
  const spaces = computed(() => store.getters['runtime/spaces/spaces'])
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
      if (unref(space) && driveAliasAndItem.startsWith(unref(space).driveAlias)) {
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
      } else if (driveAliasAndItem.startsWith('share/')) {
        const [shareName, ...item] = driveAliasAndItem.split('/').slice(1)
        matchingSpace = buildShareSpaceResource({
          shareId: queryItemAsString(unref(shareId)),
          shareName: unref(shareName),
          serverUrl: configurationManager.serverUrl
        })
        path = item.join('/')
      } else {
        unref(spaces).forEach((s) => {
          if (!driveAliasAndItem.startsWith(s.driveAlias)) {
            return
          }
          if (!matchingSpace || s.driveAlias.length > matchingSpace.driveAlias.length) {
            matchingSpace = s
            path = driveAliasAndItem.slice(s.driveAlias.length)
          }
        })
      }
      space.value = matchingSpace
      item.value = urlJoin(path, {
        leadingSlash: true
      })
    },
    { immediate: true }
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
    item
  }
}
