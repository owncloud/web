import { mapActions, mapGetters, mapMutations } from 'vuex'
import { clientService } from 'web-pkg/src/services'

export default {
  computed: {
    ...mapGetters(['configuration', 'getToken']),

    $_editDescription_items() {
      return [
        {
          name: 'editDescription',
          icon: 'pencil',
          label: () => {
            return this.$gettext('Change subtitle')
          },
          handler: this.$_editDescription_trigger,
          isEnabled: ({ resources }) => resources.length === 1,
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
    ...mapMutations('Files', ['UPDATE_RESOURCE_FIELD']),

    $_editDescription_trigger({ resources }) {
      if (resources.length !== 1) {
        return
      }

      const modal = {
        variation: 'passive',
        title: this.$gettext('Change subtitle for space') + ' ' + resources[0].name,
        cancelText: this.$gettext('Cancel'),
        confirmText: this.$gettext('Confirm'),
        hasInput: true,
        inputLabel: this.$gettext('Space subtitle'),
        inputValue: resources[0].description,
        onCancel: this.hideModal,
        onConfirm: (description) =>
          this.$_editDescription_editDescriptionSpace(resources[0].id, description)
      }

      this.createModal(modal)
    },

    $_editDescription_editDescriptionSpace(id, description) {
      const graphClient = clientService.graphAuthenticated(this.configuration.server, this.getToken)
      return graphClient.drives
        .updateDrive(id, { description }, {})
        .then(() => {
          this.hideModal()
          this.UPDATE_RESOURCE_FIELD({
            id,
            field: 'description',
            value: description
          })
          this.showMessage({
            title: this.$gettext('Space subtitle successfully changed')
          })
        })
        .catch((error) => {
          this.showMessage({
            title: this.$gettext('Changing space subtitle failed…'),
            desc: error,
            status: 'danger'
          })
        })
    }
  }
}
