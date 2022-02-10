import { mapActions, mapGetters, mapMutations } from 'vuex'
import { clientService } from 'web-pkg/src/services'

export default {
  computed: {
    ...mapGetters(['configuration', 'getToken']),

    $_rename_items() {
      return [
        {
          name: 'rename',
          icon: 'edit',
          label: () => {
            return this.$gettext('Rename')
          },
          handler: this.$_rename_trigger,
          isEnabled: ({ resources }) => resources.length === 1,
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
    ...mapMutations('Files', ['UPDATE_RESOURCE_FIELD']),

    $_rename_trigger({ resources }) {
      if (resources.length !== 1) {
        return
      }

      const modal = {
        variation: 'passive',
        title: this.$gettext('Rename space') + ' ' + resources[0].name,
        cancelText: this.$gettext('Cancel'),
        confirmText: this.$gettext('Rename'),
        hasInput: true,
        inputLabel: this.$gettext('Space name'),
        inputValue: resources[0].name,
        onCancel: this.hideModal,
        onConfirm: (name) => this.$_rename_renameSpace(resources[0].id, name),
        onInput: this.$_rename_checkName
      }

      this.createModal(modal)
    },

    $_rename_checkName(name) {
      if (name.trim() === '') {
        return this.setModalInputErrorMessage(this.$gettext('Space name cannot be empty'))
      }
      return this.setModalInputErrorMessage(null)
    },

    $_rename_renameSpace(id, name) {
      const graphClient = clientService.graphAuthenticated(this.configuration.server, this.getToken)
      return graphClient.drives
        .updateDrive(id, { name }, {})
        .then(() => {
          this.hideModal()
          this.UPDATE_RESOURCE_FIELD({
            id,
            field: 'name',
            value: name
          })
          this.showMessage({
            title: this.$gettext('Space name successfully changed')
          })
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
