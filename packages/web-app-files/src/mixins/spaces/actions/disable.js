import { mapActions } from 'vuex'

export default {
  computed: {
    $_disable_items() {
      return [
        {
          name: 'delete',
          icon: 'forbid-2',
          label: () => {
            return this.$gettext('Disable')
          },
          handler: this.$_disable_showModal,
          isEnabled: (space) => {
            return !(space.root?.deleted?.state === 'trashed')
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

    $_disable_showModal(space) {
      const modal = {
        variation: 'danger',
        title: this.$gettext('Disable space') + ' ' + space.name,
        cancelText: this.$gettext('Cancel'),
        confirmText: this.$gettext('Disable'),
        icon: 'alarm-warning',
        message: this.$gettext('Are you sure you want to disable this space?'),
        hasInput: false,
        onCancel: this.hideModal,
        onConfirm: () => this.$_disable_disableSpace(space.id)
      }

      this.createModal(modal)
    },

    $_disable_disableSpace(id) {
      return this.graph.drives
        .deleteDrive(id)
        .then(() => {
          this.hideModal()
          this.loadSpacesTask.perform(this)
        })
        .catch((error) => {
          this.showMessage({
            title: this.$gettext('Disabling space failed…'),
            desc: error,
            status: 'danger'
          })
        })
    },

    isDisabled(space) {
      return false
    }
  }
}
