import { canBeMoved } from '../../helpers/permissions'
import {
  isLocationCommonActive,
  isLocationPublicActive,
  isLocationSpacesActive
} from '../../router'
import { mapActions } from 'vuex'

export default {
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
            // CERNBox do not allow actions above home/project root
            const elems = resources[0].path?.split('/').filter(Boolean) || [] //"/eos/project/c/cernbox"
            if (isLocationSpacesActive(this.$router, 'files-spaces-generic') && elems.length < 5) {
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
    $_move_trigger({ resources }) {
      this.cutSelectedFiles({ ...this.$language, space: this.space, resources })
    }
  }
}
