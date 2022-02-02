import { mapActions } from 'vuex'

export default {
  computed: {
    $_editDescription_items() {
      return [
        {
          name: 'editDescription',
          icon: 'pencil',
          label: () => {
            return this.$gettext('Change description')
          },
          handler: this.$_editDescription_showModal,
          isEnabled: () => true,
          componentType: 'oc-button',
          class: 'oc-files-actions-edit-description-trigger'
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

    $_editDescription_showModal(space) {
      const modal = {
        variation: 'passive',
        title: this.$gettext('Change description for space') + ' ' + space.name,
        cancelText: this.$gettext('Cancel'),
        confirmText: this.$gettext('Confirm'),
        hasInput: true,
        inputLabel: this.$gettext('Space description'),
        inputValue: space.description,
        onCancel: this.hideModal,
        onConfirm: (description) =>
          this.$_editDescription_editDescriptionSpace(space.id, description)
      }

      this.createModal(modal)
    },

    $_editDescription_editDescriptionSpace(id, description) {
      return this.graph.drives
        .updateDrive(id, { description }, {})
        .then(() => {
          this.hideModal()
          this.loadSpacesTask.perform(this)
        })
        .catch((error) => {
          this.showMessage({
            title: this.$gettext('Renaming space description failed…'),
            desc: error,
            status: 'danger'
          })
        })
    }
  }
}
