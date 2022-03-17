import { mapActions, mapGetters, mapState } from 'vuex'
import { isLocationTrashActive } from '../../router'
import { buildWebDavFilesTrashPath, buildWebDavSpacesTrashPath } from '../../helpers/resources'

export default {
  computed: {
    ...mapGetters('Files', ['activeFiles']),
    ...mapGetters('capabilities'),
    ...mapState(['user']),
    $_emptyTrashBin_items() {
      return [
        {
          name: 'empty-trash-bin',
          icon: 'delete-bin-5',
          label: () => this.$gettext('Empty trash bin'),
          handler: this.$_emptyTrashBin_trigger,
          isEnabled: ({ resources }) => {
            if (
              !isLocationTrashActive(this.$router, 'files-trash-personal') &&
              !isLocationTrashActive(this.$router, 'files-trash-spaces-project')
            ) {
              return false
            }
            if (this.capabilities.files.permanent_deletion === false) {
              return false
            }
            // empty trash bin is not available for individual resources, but only for the trash bin as a whole
            return resources.length === 0
          },
          isDisabled: () => this.activeFiles.length === 0,
          componentType: 'oc-button',
          class: 'oc-files-actions-empty-trash-bin-trigger',
          variation: 'danger'
        }
      ]
    }
  },
  methods: {
    ...mapActions(['showMessage', 'createModal', 'hideModal', 'toggleModalConfirmButton']),
    ...mapActions('Files', ['clearTrashBin']),

    $_emptyTrashBin_trigger() {
      const modal = {
        variation: 'danger',
        title: this.$gettext('Empty trash bin'),
        cancelText: this.$gettext('Cancel'),
        confirmText: this.$gettext('Delete'),
        icon: 'alarm-warning',
        message: this.$gettext(
          'Are you sure you want to permanently delete your items in the trash bin? You can’t undo this action.'
        ),
        hasInput: false,
        onCancel: this.hideModal,
        onConfirm: () => this.$_emptyTrashBin_emptyTrashBin()
      }

      this.createModal(modal)
    },
    $_emptyTrashBin_emptyTrashBin() {
      const path = isLocationTrashActive(this.$router, 'files-trash-spaces-project')
        ? buildWebDavSpacesTrashPath(this.$route.params.storageId)
        : buildWebDavFilesTrashPath(this.user.id)

      return this.$client.fileTrash
        .clearTrashBin(path)
        .then(() => {
          this.hideModal()
          this.showMessage({
            title: this.$gettext('All deleted files were removed')
          })
          this.clearTrashBin()
        })
        .catch((error) => {
          console.error(error)
          this.showMessage({
            title: this.$pgettext(
              'Error message in case clearing the trash bin fails',
              'Failed to delete all files permanently'
            ),
            status: 'danger'
          })
        })
    }
  }
}
