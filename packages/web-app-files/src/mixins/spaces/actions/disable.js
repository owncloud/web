import { mapActions, mapGetters, mapMutations } from 'vuex'
import { clientService } from 'web-pkg/src/services'

export default {
  computed: {
    ...mapGetters(['configuration', 'getToken']),

    $_disable_items() {
      return [
        {
          name: 'disable',
          icon: 'forbid-2',
          label: () => {
            return this.$gettext('Disable')
          },
          handler: this.$_disable_trigger,
          isEnabled: ({ resources }) => {
            if (resources.length !== 1) {
              return false
            }

            return !resources[0].disabled
          },
          componentType: 'oc-button',
          class: 'oc-files-actions-disable-trigger'
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

    $_disable_trigger({ resources }) {
      if (resources.length !== 1) {
        return
      }

      const modal = {
        variation: 'danger',
        title: this.$gettext('Disable space') + ' ' + resources[0].name,
        cancelText: this.$gettext('Cancel'),
        confirmText: this.$gettext('Disable'),
        icon: 'alarm-warning',
        message: this.$gettext('Are you sure you want to disable this space?'),
        hasInput: false,
        onCancel: this.hideModal,
        onConfirm: () => this.$_disable_disableSpace(resources[0].id)
      }

      this.createModal(modal)
    },

    $_disable_disableSpace(id) {
      const graphClient = clientService.graphAuthenticated(this.configuration.server, this.getToken)
      return graphClient.drives
        .deleteDrive(id)
        .then(() => {
          this.hideModal()
          this.UPDATE_RESOURCE_FIELD({
            id,
            field: 'disabled',
            value: true
          })
          this.showMessage({
            title: this.$gettext('Space successfully disabled')
          })
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
