import {
  isLocationCommonActive,
  isLocationPublicActive,
  isLocationSpacesActive
} from '../../router'
import { mapActions, mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters('Files', ['clipboardResources']),
    isMacOs() {
      return window.navigator.platform.match('Mac')
    },
    getPasteShortcutString() {
      if (this.isMacOs) {
        return this.$pgettext('Keyboard shortcut for macOS for pasting files', '⌘ + V')
      }
      return this.$pgettext('Keyboard shortcut for non-macOS systems for pasting files', 'Ctrl + V')
    },
    $_paste_items() {
      return [
        {
          name: 'paste',
          icon: 'clipboard',
          handler: this.$_paste_trigger,
          label: () =>
            this.$pgettext('Action in the files list row to initiate pasting resources', 'Paste'),
          shortcut: this.getPasteShortcutString,
          isEnabled: ({ resources }) => {
            if (this.clipboardResources.length === 0) {
              return false
            }
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
            // CERNBox do not allow actions above home/project root
            const elems = this.$router.currentRoute?.path?.split('/').filter(Boolean) || [] //"/files/spaces/eos/project/c/cernbox"
            if (isLocationSpacesActive(this.$router, 'files-spaces-generic') && elems.length < 6) { //WE CAN PASTE IN ROOT
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
    ...mapActions(['showMessage', 'createModal', 'hideModal']),
    ...mapActions('Files', ['pasteSelectedFiles']),

    $_paste_trigger() {
      this.pasteSelectedFiles({
        targetSpace: this.space,
        clientService: this.$clientService,
        createModal: this.createModal,
        hideModal: this.hideModal,
        showMessage: this.showMessage,
        $gettext: this.$gettext,
        $gettextInterpolate: this.$gettextInterpolate,
        $ngettext: this.$ngettext
      })
    }
  }
}
