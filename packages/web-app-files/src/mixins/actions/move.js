import { canBeMoved } from '../../helpers/permissions'
import {
  isLocationCommonActive,
  isLocationPublicActive,
  isLocationSpacesActive
} from '../../router'
import { mapActions } from 'vuex'
import { mapGetters } from 'vuex'

export default {
  ...mapGetters(['homeFolder']),
  computed: {
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
              !isLocationSpacesActive(this.$router, 'files-spaces-personal') &&
              !isLocationSpacesActive(this.$router, 'files-spaces-project') &&
              !isLocationSpacesActive(this.$router, 'files-spaces-share') &&
              !isLocationPublicActive(this.$router, 'files-public-files') &&
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
              return canBeMoved(resource, this.currentFolder.path) === false || resource.path === this.homeFolder
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
    $_move_trigger() {
      this.cutSelectedFiles()
    }
  }
}
