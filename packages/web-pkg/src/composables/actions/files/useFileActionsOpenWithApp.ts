import { FileAction, FileActionOptions } from '../types'
import { useIsFilesAppActive, useIsSearchActive } from '../helpers'
import { computed, unref } from 'vue'
import { useGettext } from 'vue3-gettext'
import { useEmbedMode } from '../../embedMode'
import { useAppsStore, useModals } from '../../piniaStores'
import { storeToRefs } from 'pinia'
import FilePickerModal from '../../../components/Modals/FilePickerModal.vue'
import { useFolderLink } from '../../folderLink'

export const useFileActionsOpenWithApp = ({ appId }: { appId: string }) => {
  const { $gettext } = useGettext()
  const isFilesAppActive = useIsFilesAppActive()
  const isSearchActive = useIsSearchActive()
  const { isEnabled: isEmbedModeEnabled } = useEmbedMode()
  const { dispatchModal } = useModals()
  const appsStore = useAppsStore()
  const { apps } = storeToRefs(appsStore)
  const { getParentFolderLink } = useFolderLink()

  const handler = ({ space, resources }: FileActionOptions) => {
    const app = unref(apps)[appId]
    const parentFolderLink = getParentFolderLink(resources[0])

    dispatchModal({
      elementClass: 'open-with-app-modal',
      title: $gettext('Open file with %{app}', { app: app.name }),
      hideConfirmButton: true,
      customComponent: FilePickerModal,
      customComponentAttrs: () => ({
        app,
        parentFolderLink
      }),
      focusTrapInitial: false
    })
  }

  const actions = computed((): FileAction[] => [
    {
      name: 'open-with-app',
      icon: 'folder-open',
      handler,
      label: () => {
        return $gettext('Open')
      },
      isVisible: ({ resources }) => {
        if (!unref(isFilesAppActive) && !unref(isSearchActive) && unref(isEmbedModeEnabled)) {
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
      componentType: 'button',
      class: 'oc-files-actions-open-with-app-trigger'
    }
  ])

  return {
    actions
  }
}
