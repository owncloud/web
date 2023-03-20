import {
  isLocationCommonActive,
  isLocationPublicActive,
  isLocationSharesActive,
  isLocationSpacesActive
} from '../../../router'
import { useIsFilesAppActive } from '../helpers/useIsFilesAppActive'
import path from 'path'
import first from 'lodash-es/first'
import { archiverService } from '../../../services'
import { isPublicSpaceResource, Resource } from 'web-client/src/helpers'
import { Store } from 'vuex'
import { computed, unref } from 'vue'
import {
  useClientService,
  useLoadingService,
  usePublicLinkPassword,
  useRouter,
  useStore
} from 'web-pkg/src/composables'
import { FileAction, FileActionOptions } from 'web-pkg/src/composables/actions'
import { useGettext } from 'vue3-gettext'

export const useFileActionsDownloadArchive = ({ store }: { store?: Store<any> } = {}) => {
  store = store || useStore()
  const router = useRouter()
  const loadingService = useLoadingService()
  const { $ngettext, $gettext } = useGettext()
  const clientService = useClientService()
  const publicLinkPassword = usePublicLinkPassword({ store })
  const isFilesAppActive = useIsFilesAppActive()

  const handler = ({ space, resources }: FileActionOptions) => {
    const fileOptions = archiverService.fileIdsSupported
      ? {
          fileIds: resources.map((resource) => resource.fileId)
        }
      : {
          dir: path.dirname(first<Resource>(resources).path) || '/',
          files: resources.map((resource) => resource.name)
        }
    return archiverService
      .triggerDownload({
        clientService,
        ...fileOptions,
        ...(isPublicSpaceResource(space) && {
          publicToken: space.id as string,
          publicLinkPassword: unref(publicLinkPassword)
        })
      })
      .catch((e) => {
        console.error(e)
        store.dispatch('showMessage', {
          title: $ngettext(
            'Failed to download the selected folder.', // on single selection only available for folders
            'Failed to download the selected files.', // on multi selection available for files+folders
            resources.length
          ),
          status: 'danger'
        })
      })
  }

  const actions = computed((): FileAction[] => {
    return [
      {
        name: 'download-archive',
        icon: 'inbox-archive',
        handler: (args) => loadingService.addTask(() => handler(args)),
        label: () => {
          return $gettext('Download')
        },
        isEnabled: ({ resources }) => {
          if (
            unref(isFilesAppActive) &&
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
          if (isLocationSpacesActive(router, 'files-spaces-projects')) {
            return false
          }
          if (resources.length === 0) {
            return false
          }
          if (resources.length === 1 && !resources[0].isFolder) {
            return false
          }
          if (!archiverService.available) {
            return false
          }
          if (
            !archiverService.fileIdsSupported &&
            isLocationCommonActive(router, 'files-common-favorites')
          ) {
            return false
          }
          const downloadDisabled = resources.some((resource) => {
            return !resource.canDownload()
          })
          return !downloadDisabled
        },
        canBeDefault: true,
        componentType: 'button',
        class: 'oc-files-actions-download-archive-trigger'
      }
    ]
  })

  return {
    actions
  }
}
