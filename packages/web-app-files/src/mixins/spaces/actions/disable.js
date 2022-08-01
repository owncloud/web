import { mapActions, mapGetters, mapMutations, mapState } from 'vuex'
import { clientService } from 'web-pkg/src/services'
import { createLocationSpaces, isLocationSpacesActive } from '../../../router'

export default {
  computed: {
    ...mapGetters(['configuration']),
    ...mapGetters('runtime/auth', ['accessToken']),
    ...mapState(['user']),

    $_disable_items() {
      return [
        {
          name: 'disable',
          icon: 'stop-circle',
          label: () => {
            return this.$gettext('Disable')
          },
          handler: this.$_disable_trigger,
          isEnabled: ({ resources }) => {
            if (resources.length !== 1) {
              return false
            }

            return resources[0].canDisable({ user: this.user })
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
        icon: 'alarm-warning',
        title: this.$gettext('Disable space') + ' ' + resources[0].name,
        cancelText: this.$gettext('Cancel'),
        confirmText: this.$gettext('Disable'),
        message: this.$gettext('Are you sure you want to disable this space?'),
        hasInput: false,
        onCancel: this.hideModal,
        onConfirm: () => this.$_disable_disableSpace(resources[0].id)
      }

      this.createModal(modal)
    },

    $_disable_disableSpace(id) {
      const graphClient = clientService.graphAuthenticated(
        this.configuration.server,
        this.accessToken
      )
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
            title: this.$gettext('Space was disabled successfully')
          })
          if (isLocationSpacesActive(this.$router, 'files-spaces-project')) {
            this.$router.push(createLocationSpaces('files-spaces-projects'))
          }
        })
        .catch((error) => {
          console.error(error)
          this.showMessage({
            title: this.$gettext('Failed to disable space'),
            status: 'danger'
          })
        })
    },

    isDisabled(space) {
      return false
    }
  }
}
