import {
  isLocationCommonActive,
  isLocationPublicActive,
  isLocationSharesActive,
  isLocationSpacesActive
} from '../../router'
import { useIsFilesAppActive } from './helpers/isFilesAppActive'
import { useRouter } from 'web-pkg/src'
import { Action, useIsSearchActive } from 'web-pkg/src/composables/actions'
import { computed, unref } from 'vue'
import { useGettext } from 'vue3-gettext'

export const useDownloadFile = () => {
  const router = useRouter()
  const { $gettext } = useGettext()
  const isFilesAppActive = useIsFilesAppActive()
  const isSearchActive = useIsSearchActive()

  const handler = ({ resources }) => {
    // FIXME: refactor mixin web plugin mixin
    console.warn('Cannot download', resources[0])
    // this.downloadFile(resources[0])
  }

  const actions = computed((): Action[] => [
    {
      name: 'download-file',
      icon: 'file-download',
      handler,
      label: () => {
        return $gettext('Download')
      },
      isEnabled: ({ resources }) => {
        if (
          unref(isFilesAppActive) &&
          !unref(isSearchActive) &&
          !isLocationSpacesActive(router, 'files-spaces-generic') &&
          !isLocationPublicActive(router, 'files-public-link') &&
          !isLocationCommonActive(router, 'files-common-favorites') &&
          !isLocationCommonActive(router, 'files-common-search') &&
          !isLocationSharesActive(router, 'files-shares-with-me') &&
          !isLocationSharesActive(router, 'files-shares-with-others') &&
          !isLocationSharesActive(router, 'files-shares-via-link')
        ) {
          return false
        }
        if (resources.length !== 1) {
          return false
        }
        if (resources[0].isFolder) {
          return false
        }
        return resources[0].canDownload()
      },
      canBeDefault: true,
      componentType: 'button',
      class: 'oc-files-actions-download-file-trigger'
    }
  ])

  return {
    actions
  }
}
