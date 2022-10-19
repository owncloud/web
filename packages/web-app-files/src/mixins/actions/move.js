import { canBeMoved } from '../../helpers/permissions'
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
    getCutShortcutString() {
      if (this.isMacOs) {
        return this.$pgettext('Keyboard shortcut for macOS for cutting files', '⌘ + X')
      }
      return this.$pgettext('Keyboard shortcut for non-macOS systems for cutting files', 'Ctrl + X')
    },
    $_move_items() {
      return [
        {
          name: 'cut',
          icon: 'scissors',
          handler: this.$_move_trigger,
          shortcut: this.getCutShortcutString,
          label: () =>
            this.$pgettext('Action in the files list row to initiate cutting resources', 'Cut'),
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

            if (!this.currentFolder) {
              return false
            }

            const moveDisabled = resources.some((resource) => {
              return canBeMoved(resource, this.currentFolder.path) === false
            })
            return !moveDisabled
          },
          componentType: 'button',
          class: 'oc-files-actions-move-trigger'
        }
      ]
    }
  },
  methods: {
    ...mapActions('Files', ['cutSelectedFiles']),
    ...mapMutations('Files', ['SET_FILE_SELECTION']),
    $_move_trigger({ resources }) {
      this.SET_FILE_SELECTION(resources)
      this.cutSelectedFiles({ space: this.space })
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
