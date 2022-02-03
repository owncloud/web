import { mapActions } from 'vuex'

export default {
  computed: {
    $_restore_items() {
      return [
        {
          name: 'restore',
          icon: 'restart',
          label: () => {
            return this.$gettext('Restore')
          },
          handler: this.$_restore_showModal,
          isEnabled: (space) => {
            // TODO: check property after API is capable
            return space.id.includes('.T.')
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

    $_restore_showModal(space) {
      const modal = {
        variation: 'passive',
        title: this.$gettext('Restore space') + ' ' + space.name,
        cancelText: this.$gettext('Cancel'),
        confirmText: this.$gettext('Restore'),
        icon: 'alarm-warning',
        message: this.$gettext('Are you sure you want to restore this space?'),
        hasInput: false,
        onCancel: this.hideModal,
        onConfirm: () => this.$_restore_restoreSpace(space.id)
      }

      this.createModal(modal)
    },

    $_restore_restoreSpace(id) {
      return this.graph.drives
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
