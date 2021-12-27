import { mapActions } from 'vuex'

export default {
  computed: {
    $_rename_items() {
      return [
        {
          name: 'rename',
          icon: 'edit',
          label: () => {
            return this.$gettext('Rename')
          },
          handler: this.$_rename_showModal,
          isEnabled: () => true,
          componentType: 'oc-button',
          class: 'oc-files-actions-rename-trigger'
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

    $_rename_showModal(space) {
      const checkInputValue = (value) => {
        if (value.trim() === '') {
          this.setModalInputErrorMessage(this.$gettext('Space name cannot be empty'))
        }
      }

      const modal = {
        variation: 'passive',
        title: this.$gettext('Rename space') + ' ' + space.name,
        cancelText: this.$gettext('Cancel'),
        confirmText: this.$gettext('Rename'),
        hasInput: true,
        inputLabel: this.$gettext('Space name'),
        inputValue: space.name,
        onCancel: this.hideModal,
        onConfirm: (name) => this.$_rename_renameSpace(space.id, name),
        onInput: checkInputValue
      }

      this.createModal(modal)
    },

    $_rename_renameSpace(id, name) {
      return this.graph.drives
        .updateDrive(id, { name }, {})
        .then(() => {
          this.hideModal()
          this.loadSpacesTask.perform(this)
        })
        .catch((error) => {
          this.showMessage({
            title: this.$gettext('Renaming space failed…'),
            desc: error,
            status: 'danger'
          })
        })
    }
  }
}
