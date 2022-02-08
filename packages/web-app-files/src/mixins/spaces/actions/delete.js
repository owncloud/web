import { mapActions } from 'vuex'

export default {
  computed: {
    $_delete_items() {
      return [
        {
          name: 'delete',
          icon: 'delete-bin-5',
          label: () => {
            return this.$gettext('Delete')
          },
          handler: this.$_delete_trigger,
          isEnabled: ({ spaces }) => {
            if (spaces.length === 0) {
              return false
            }

            return spaces.every((space) => space.root?.deleted?.state === 'trashed')
          },
          componentType: 'oc-button',
          class: 'oc-files-actions-delete-trigger'
        }
      ]
    }
  },
  methods: {
    ...mapActions([
      'createModal',
      'hideModal',
      'setModalInputErrorMessage',
      'showMessage',
      'toggleModalConfirmButton'
    ]),

    $_delete_trigger({ spaces }) {
      const modal = {
        variation: 'danger',
        title: this.$gettext('Delete space') + ' ' + spaces[0].name,
        cancelText: this.$gettext('Cancel'),
        confirmText: this.$gettext('Delete'),
        icon: 'alarm-warning',
        message: this.$gettext('Are you sure you want to delete this space?'),
        hasInput: false,
        onCancel: this.hideModal,
        onConfirm: () => this.$_delete_deleteSpace(spaces[0].id)
      }

      this.createModal(modal)
    },

    $_delete_deleteSpace(id) {
      return this.graph.drives
        .deleteDrive(id, '', {
          headers: {
            Purge: 'T'
          }
        })
        .then(() => {
          this.hideModal()
          this.loadSpacesTask.perform(this)
        })
        .catch((error) => {
          this.showMessage({
            title: this.$gettext('Deleting space failed…'),
            desc: error,
            status: 'danger'
          })
        })
    }
  }
}
