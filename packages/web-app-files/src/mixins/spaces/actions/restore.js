import { mapActions, mapGetters } from 'vuex'
import { clientService } from 'web-pkg/src/services'

export default {
  computed: {
    ...mapGetters(['configuration', 'getToken']),

    $_restore_items() {
      return [
        {
          name: 'restore',
          icon: 'restart',
          label: () => {
            return this.$gettext('Restore')
          },
          handler: this.$_restore_trigger,
          isEnabled: ({ spaces }) => {
            if (spaces.length !== 1) {
              return false
            }

            return spaces[0].root?.deleted?.state === 'trashed'
          },
          componentType: 'oc-button',
          class: 'oc-files-actions-restore-trigger'
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

    $_restore_trigger({ spaces }) {
      if (spaces.length !== 1) {
        return
      }

      const modal = {
        variation: 'passive',
        title: this.$gettext('Restore space') + ' ' + spaces[0].name,
        cancelText: this.$gettext('Cancel'),
        confirmText: this.$gettext('Restore'),
        icon: 'alarm-warning',
        message: this.$gettext('Are you sure you want to restore this space?'),
        hasInput: false,
        onCancel: this.hideModal,
        onConfirm: () => this.$_restore_restoreSpace(spaces[0].id)
      }

      this.createModal(modal)
    },

    $_restore_restoreSpace(id) {
      const graphClient = clientService.graphAuthenticated(this.configuration.server, this.getToken)
      return graphClient.drives
        .updateDrive(
          id,
          {},
          {
            headers: {
              Restore: true
            }
          }
        )
        .then(() => {
          this.hideModal()
          this.loadSpacesTask.perform(this)
        })
        .catch((error) => {
          this.showMessage({
            title: this.$gettext('Restoring space failed…'),
            desc: error,
            status: 'danger'
          })
        })
    }
  }
}
