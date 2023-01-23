import { mapActions, mapGetters, mapState } from 'vuex'
import { isLocationTrashActive } from '../../router'
import { buildWebDavFilesTrashPath } from '../../helpers/resources'
import { buildWebDavSpacesTrashPath } from 'web-client/src/helpers'
import { isProjectSpaceResource } from 'web-client/src/helpers'

export default {
  computed: {
    ...mapGetters('Files', ['activeFiles']),
    ...mapGetters(['capabilities']),
    ...mapState(['user']),
    $_emptyTrashBin_items() {
      return [
        {
          name: 'empty-trash-bin',
          icon: 'delete-bin-5',
          label: () => this.$gettext('Empty trash bin'),
          handler: this.$_emptyTrashBin_trigger,
          isEnabled: ({ resources }) => {
            if (!isLocationTrashActive(this.$router, 'files-trash-generic')) {
              return false
            }
            if (this.capabilities?.files?.permanent_deletion === false) {
              return false
            }

            if (
              isProjectSpaceResource(this.space) &&
              !this.space.isEditor(this.user) &&
              !this.space.isManager(this.user)
            ) {
              return false
            }

            // empty trash bin is not available for individual resources, but only for the trash bin as a whole
            return resources.length === 0
          },
          isDisabled: () => this.activeFiles.length === 0,
          componentType: 'button',
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
        icon: 'alarm-warning',
        title: this.$gettext('Empty trash bin'),
        cancelText: this.$gettext('Cancel'),
        confirmText: this.$gettext('Delete'),
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
      const hasShareJail = this.capabilities?.spaces?.share_jail === true
      const path = hasShareJail
        ? buildWebDavSpacesTrashPath(this.space.id)
        : buildWebDavFilesTrashPath(this.user.id)

      return this.$client.fileTrash
        .clearTrashBin(path)
        .then(() => {
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
        .finally(() => {
          this.hideModal()
        })
    }
  }
}
