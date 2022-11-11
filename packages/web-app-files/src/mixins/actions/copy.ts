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
            if (isLocationSpacesActive(this.$router, 'files-spaces-projects')) {
              return false
            }
            if (resources.length === 0) {
              return false
            }

            if (isLocationPublicActive(this.$router, 'files-public-link')) {
              return this.currentFolder.canCreate()
            }
            // CERNBox do not allow actions above home/project root
            const elems = resources[0].path?.split('/').filter(Boolean) || [] //"/eos/project/c/cernbox"
            if (isLocationSpacesActive(this.$router, 'files-spaces-generic') && elems.length < 5) {
              return false
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
    $_copy_trigger({ resources }) {
      this.copySelectedFiles({ ...this.$language, space: this.space, resources })
    }
  }
}
