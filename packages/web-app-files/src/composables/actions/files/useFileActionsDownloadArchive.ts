import {
  isLocationCommonActive,
  isLocationPublicActive,
  isLocationSharesActive,
  isLocationSpacesActive
} from '../../../router'
import { useIsFilesAppActive } from '../helpers/useIsFilesAppActive'
import path from 'path'
import first from 'lodash-es/first'
import { isProjectSpaceResource, isPublicSpaceResource, Resource } from 'web-client/src/helpers'
import { Store } from 'vuex'
import { computed, unref } from 'vue'
import {
  useLoadingService,
  usePublicLinkPassword,
  useRouter,
  useStore
} from 'web-pkg/src/composables'
import { FileAction, FileActionOptions } from 'web-pkg/src/composables/actions'
import { useGettext } from 'vue3-gettext'
import { useArchiverService } from 'web-pkg/src/composables/archiverService'
import { formatFileSize } from 'web-pkg/src/helpers/filesize'

export const useFileActionsDownloadArchive = ({ store }: { store?: Store<any> } = {}) => {
  store = store || useStore()
  const router = useRouter()
  const loadingService = useLoadingService()
  const archiverService = useArchiverService()
  const { $ngettext, $gettext, interpolate: $gettextInterpolate, current } = useGettext()
  const publicLinkPassword = usePublicLinkPassword({ store })
  const isFilesAppActive = useIsFilesAppActive()

  const handler = ({ space, resources }: FileActionOptions) => {
    if (resources.length > 1) {
      // the handler can be triggered successfully if project spaces are selected along with other files.
      // but we must filter out the project spaces in such a case (only the other selected files are allowed for download).
      resources = resources.filter((r) => r.canDownload() && !isProjectSpaceResource(r))
    }

    const fileOptions = unref(archiverService.fileIdsSupported)
      ? {
          fileIds: resources.map((resource) => resource.fileId)
        }
      : {
          dir: path.dirname(first<Resource>(resources).path) || '/',
          files: resources.map((resource) => resource.name)
        }
    return archiverService
      .triggerDownload({
        ...fileOptions,
        ...(space &&
          isPublicSpaceResource(space) && {
            publicToken: space.id as string,
            publicLinkPassword: unref(publicLinkPassword)
          })
      })
      .catch((e) => {
        console.error(e)
        store.dispatch('showErrorMessage', {
          title: $ngettext(
            'Failed to download the selected folder.', // on single selection only available for folders
            'Failed to download the selected files.', // on multi selection available for files+folders
            resources.length
          ),
          error: e
        })
      })
  }

  const areArchiverLimitsExceeded = (resources: Resource[]) => {
    const archiverCapabilities = unref(archiverService.capability)
    if (!archiverCapabilities) {
      return
    }

    const selectedFilesSize = resources.reduce(
      (accumulator, currentValue) => accumulator + parseInt(`${currentValue.size}`),
      0
    )

    return selectedFilesSize > parseInt(archiverCapabilities.max_size)
  }

  const actions = computed((): FileAction[] => {
    return [
      {
        name: 'download-archive',
        icon: 'inbox-archive',
        handler: async (args) => {
          await loadingService.addTask(() => handler(args))
        },
        label: ({ resources }) => {
          const downloadLabel = $gettext('Download')

          if (isLocationCommonActive(router, 'files-common-search') && resources.length > 1) {
            const downloadableResourcesCount = resources.filter(
              (r) => r.canDownload() && !isProjectSpaceResource(r)
            ).length
            return `${downloadLabel} (${downloadableResourcesCount.toString()})`
          }

          return downloadLabel
        },
        disabledTooltip: ({ resources }) => {
          return areArchiverLimitsExceeded(resources)
            ? $gettextInterpolate(
                $gettext('The selection exceeds the allowed archive size (max. %{maxSize})'),
                {
                  maxSize: formatFileSize(unref(archiverService.capability).max_size, current)
                }
              )
            : ''
        },
        isDisabled: ({ resources }) => areArchiverLimitsExceeded(resources),
        isEnabled: ({ resources }) => {
          if (
            unref(isFilesAppActive) &&
            !isLocationSpacesActive(router, 'files-spaces-generic') &&
            !isLocationPublicActive(router, 'files-public-link') &&
            !isLocationCommonActive(router, 'files-common-favorites') &&
            !isLocationCommonActive(router, 'files-common-search') &&
            !isLocationSharesActive(router, 'files-shares-with-me') &&
            !isLocationSharesActive(router, 'files-shares-with-others') &&
            !isLocationSharesActive(router, 'files-shares-via-link') &&
            !isLocationCommonActive(router, 'files-common-search')
          ) {
            return false
          }
          if (!unref(archiverService.available)) {
            return false
          }

          if (resources.length === 0) {
            return false
          }
          if (resources.length === 1 && !resources[0].isFolder) {
            return false
          }
          if (resources.length > 1 && resources.every((r) => isProjectSpaceResource(r))) {
            return false
          }
          if (isProjectSpaceResource(resources[0]) && resources[0].disabled) {
            return false
          }
          if (
            !unref(archiverService.fileIdsSupported) &&
            isLocationCommonActive(router, 'files-common-favorites')
          ) {
            return false
          }

          const downloadDisabled = resources.some((resource) => {
            return !resource.canDownload()
          })
          return !downloadDisabled
        },
        componentType: 'button',
        class: 'oc-files-actions-download-archive-trigger'
      }
    ]
  })

  return {
    actions
  }
}
