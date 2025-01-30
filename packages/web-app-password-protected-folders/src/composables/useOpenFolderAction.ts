import { FileAction } from '@ownclouders/web-pkg'
import { computed } from 'vue'
import { useGettext } from 'vue3-gettext'

export const useOpenFolderAction = () => {
  const { $gettext } = useGettext()

  const action = computed<FileAction>(() => ({
    name: 'open-password-protected-folder',
    icon: 'external-link',
    handler: () => {
      // TODO: add handler
      console.warn('NOT IMPLEMENTED')
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
