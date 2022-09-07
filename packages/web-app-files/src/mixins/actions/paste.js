import {
  isLocationCommonActive,
  isLocationPublicActive,
  isLocationSpacesActive
} from '../../router'
import { mapActions, mapMutations, mapGetters } from 'vuex'

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
            if (this.clipboardResources.length === 0) return false
            if (
              !isLocationSpacesActive(this.$router, 'files-spaces-generic') &&
              !isLocationSpacesActive(this.$router, 'files-spaces-share') &&
              !isLocationPublicActive(this.$router, 'files-public-files') &&
              !isLocationCommonActive(this.$router, 'files-common-favorites')
            ) {
              return false
            }
            if (resources.length === 0) {
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
    ...mapActions(['showMessage', 'createModal', 'hideModal']),
    ...mapActions('Files', ['pasteSelectedFiles']),
    ...mapMutations('Files', {
      upsertResource: 'UPSERT_RESOURCE'
    }),

    $_paste_trigger() {
      const isPublicLinkContext = this.$store.getters['runtime/auth/isPublicLinkContextReady']
      const publicLinkPassword = this.$store.getters['runtime/auth/publicLinkPassword']
      this.pasteSelectedFiles({
        client: this.$client,
        createModal: this.createModal,
        hideModal: this.hideModal,
        showMessage: this.showMessage,
        $gettext: this.$gettext,
        $gettextInterpolate: this.$gettextInterpolate,
        $ngettext: this.$ngettext,
        isPublicLinkContext,
        publicLinkPassword,
        upsertResource: this.upsertResource
      })
    }
  }
}
