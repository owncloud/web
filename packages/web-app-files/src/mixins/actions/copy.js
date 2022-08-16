import {
  isLocationCommonActive,
  isLocationPublicActive,
  isLocationSpacesActive
} from '../../router'
import { mapActions } from 'vuex'
import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters(['homeFolder']),
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
            if (resources[0].path === this.homeFolder) {
              return false
            }

            if (isLocationPublicActive(this.$router, 'files-public-files')) {
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

    $_copy_trigger() {
      this.copySelectedFiles()
    }
  }
}
