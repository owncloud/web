import { FileAction, useClientService, useModals } from '@ownclouders/web-pkg'
import { computed } from 'vue'
import { useGettext } from 'vue3-gettext'
import FolderViewModal from '../components/FolderViewModal.vue'

export const useOpenFolderAction = () => {
  const { $gettext } = useGettext()
  const { dispatchModal } = useModals()
  const clientService = useClientService()

  const action = computed<FileAction>(() => ({
    name: 'open-password-protected-folder',
    icon: 'external-link',
    async handler({ resources, space }) {
      const [file] = resources
      const { body } = await clientService.webdav.getFileContents(space, file)
      const publicLink = atob(body)

      dispatchModal({
        title: resources.at(0).name,
        elementClass: 'folder-view-modal',
        customComponent: FolderViewModal,
        customComponentAttrs: () => ({
          publicLink
        }),
        hideConfirmButton: true,
        cancelText: $gettext('Close folder')
      })
    },
    label: () => $gettext('Open folder'),
    isDisabled: () => false,
    isVisible: ({ resources }) => {
      if (resources.length !== 1) {
        return false
      }

      return resources[0].extension === 'psec'
    },
    componentType: 'button',
    class: 'oc-files-actions-open-password-protected-folder'
  }))

  return action
}
