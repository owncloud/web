import {
  isLocationCommonActive,
  isLocationPublicActive,
  isLocationSpacesActive
} from '../../router'
import { mapActions, mapGetters, mapMutations } from 'vuex'
import { createFileRouteOptions } from 'web-pkg/src/helpers/router'
import { dirname } from 'path'

export default {
  computed: {
    ...mapGetters('Files', ['currentFolder']),
    isMacOs() {
      return window.navigator.platform.match('Mac')
    },
    getCopyShortcutString() {
      if (this.isMacOs) {
        return this.$pgettext('Keyboard shortcut for macOS for copying files', '⌘ + C')
      }
      return this.$pgettext('Keyboard shortcut for non-macOS systems for copying files', 'Ctrl + C')
    },
    $_copy_items() {
      return [
        {
          name: 'copy',
          icon: 'file-copy-2',
          handler: this.$_copy_trigger,
          shortcut: this.getCopyShortcutString,
          label: () =>
            this.$pgettext('Action in the files list row to initiate copying resources', 'Copy'),
          isEnabled: ({ resources }) => {
            if (
              !isLocationSpacesActive(this.$router, 'files-spaces-generic') &&
              !isLocationPublicActive(this.$router, 'files-public-link') &&
              !isLocationCommonActive(this.$router, 'files-common-favorites')
            ) {
              return false
            }
            if (resources.length === 0) {
              return false
            }

            if (isLocationPublicActive(this.$router, 'files-public-link')) {
              return this.currentFolder.canCreate()
            }

            // copy can't be restricted in authenticated context, because
            // a user always has their home dir with write access
            return true
          },
          componentType: 'button',
          class: 'oc-files-actions-copy-trigger'
        }
      ]
    }
  },
  methods: {
    ...mapActions('Files', ['copySelectedFiles']),
    ...mapMutations('Files', ['SET_FILE_SELECTION']),
    $_copy_trigger({ resources }) {
      this.SET_FILE_SELECTION(resources)
      this.copySelectedFiles({ space: this.space })
      const currentFolderSelected = resources.some((r) => r.id === this.currentFolder?.id)
      if (currentFolderSelected) {
        return this.$router.push(
          createFileRouteOptions(this.space, {
            path: dirname(this.currentFolder.path),
            fileId: this.currentFolder.parentFolderId
          })
        )
      }
    }
  }
}
