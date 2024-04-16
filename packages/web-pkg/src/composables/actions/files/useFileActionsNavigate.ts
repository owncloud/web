import { isSameResource } from '../../../helpers/resource'
import {
  createLocationPublic,
  createLocationSpaces,
  isLocationPublicActive,
  isLocationSharesActive,
  isLocationTrashActive
} from '../../../router'
import { isIncomingShareResource } from '@ownclouders/web-client'
import merge from 'lodash-es/merge'
import { isShareSpaceResource, SpaceResource } from '@ownclouders/web-client'
import { createFileRouteOptions } from '../../../helpers/router'
import { useGetMatchingSpace } from '../../spaces'
import { useRouter } from '../../router'
import { computed, unref } from 'vue'
import { useGettext } from 'vue3-gettext'
import { FileAction } from '../types'
import { useResourcesStore } from '../../piniaStores'
import { storeToRefs } from 'pinia'

export const useFileActionsNavigate = () => {
  const router = useRouter()
  const { $gettext } = useGettext()
  const { getMatchingSpace } = useGetMatchingSpace()

  const resourcesStore = useResourcesStore()
  const { currentFolder } = storeToRefs(resourcesStore)

  const getSpace = (space: SpaceResource) => {
    return space ? space : getMatchingSpace(space)
  }

  const routeName = computed(() => {
    if (isLocationPublicActive(router, 'files-public-link')) {
      return createLocationPublic('files-public-link')
    }

    return createLocationSpaces('files-spaces-generic')
  })

  const actions = computed((): FileAction[] => [
    {
      name: 'navigate',
      icon: 'folder-open',
      label: () => $gettext('Open folder'),
      isVisible: ({ resources }) => {
        if (isLocationTrashActive(router, 'files-trash-generic')) {
          return false
        }
        if (resources.length !== 1) {
          return false
        }

        if (unref(currentFolder) !== null && isSameResource(resources[0], unref(currentFolder))) {
          return false
        }

        if (!resources[0].isFolder || resources[0].type === 'space') {
          return false
        }

        if (isIncomingShareResource(resources[0]) && !resources[0].syncEnabled) {
          return false
        }

        return true
      },
      componentType: 'router-link',
      route: ({ space, resources }) => {
        if (
          isShareSpaceResource(space) &&
          (isLocationSharesActive(router, 'files-shares-with-others') ||
            isLocationSharesActive(router, 'files-shares-via-link'))
        ) {
          // FIXME: This is a hacky way to resolve re-shares, but we don't have other options currently
          return { name: 'resolvePrivateLink', params: { fileId: resources[0].fileId } }
        }

        return merge(
          {},
          unref(routeName),
          createFileRouteOptions(getSpace(space), {
            path: resources[0].path,
            fileId: resources[0].fileId
          })
        )
      },
      class: 'oc-files-actions-navigate-trigger'
    }
  ])

  return {
    actions
  }
}
