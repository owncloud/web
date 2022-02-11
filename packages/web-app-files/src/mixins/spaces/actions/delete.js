import { mapActions, mapGetters } from 'vuex'
import { clientService } from 'web-pkg/src/services'

export default {
  computed: {
    ...mapGetters(['configuration', 'getToken']),

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
            if (spaces.length !== 1) {
              return false
            }

            return spaces[0].root?.deleted?.state === 'trashed'
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
      if (spaces.length !== 1) {
        return
      }

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
      const graphClient = clientService.graphAuthenticated(this.configuration.server, this.getToken)
      return graphClient.drives
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
