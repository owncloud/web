import { mapActions, mapGetters, mapMutations, mapState } from 'vuex'
import { clientService } from 'web-pkg/src/services'
import { createLocationSpaces, isLocationSpacesActive } from '../../../router'

export default {
  computed: {
    ...mapGetters(['configuration']),
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
          componentType: 'button',
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
    ...mapMutations('runtime/spaces', ['UPDATE_SPACE_FIELD']),

    $_disable_trigger({ resources }) {
      if (resources.length !== 1) {
        return
      }

      const message = this.$gettextInterpolate(
        this.$gettext(
          'If you disable the space "%{spaceName}", it can no longer be accessed. Only Space managers will still have access. Note: No files will be deleted from the server.'
        ),
        { spaceName: resources[0].name }
      )
      const modal = {
        variation: 'danger',
        icon: 'alarm-warning',
        title: this.$gettext('Disable Space?'),
        cancelText: this.$gettext('Cancel'),
        confirmText: this.$gettext('Disable'),
        message,
        hasInput: false,
        onCancel: this.hideModal,
        onConfirm: () => this.$_disable_disableSpace(resources[0].id)
      }

      this.createModal(modal)
    },

    $_disable_disableSpace(id) {
      const accessToken = this.$store.getters['runtime/auth/accessToken']
      const graphClient = clientService.graphAuthenticated(this.configuration.server, accessToken)
      return graphClient.drives
        .deleteDrive(id)
        .then(() => {
          this.hideModal()
          this.UPDATE_SPACE_FIELD({
            id,
            field: 'disabled',
            value: true
          })
          this.showMessage({
            title: this.$gettext('Space was disabled successfully')
          })
          if (isLocationSpacesActive(this.$router, 'files-spaces-projects')) {
            return
          }
          if (isLocationSpacesActive(this.$router, 'files-spaces-generic')) {
            return this.$router.push(createLocationSpaces('files-spaces-projects'))
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
