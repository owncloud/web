import { mapActions, mapGetters, mapMutations } from 'vuex'
import { clientService } from 'web-pkg/src/services'
import { Drive } from 'web-client/src/generated'

export default {
  computed: {
    ...mapGetters(['configuration']),

    $_editDescription_items() {
      return [
        {
          name: 'editDescription',
          icon: 'h-2',
          iconFillType: 'none',
          label: () => {
            return this.$gettext('Edit subtitle')
          },
          handler: this.$_editDescription_trigger,
          isEnabled: ({ resources }) => {
            if (resources.length !== 1) {
              return false
            }

            return resources[0].canEditDescription({ user: this.user })
          },
          componentType: 'button',
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
    ...mapMutations('runtime/spaces', ['UPDATE_SPACE_FIELD']),

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
          this.$_editDescription_editDescriptionSpace(resources[0], description)
      }

      this.createModal(modal)
    },

    $_editDescription_editDescriptionSpace(space, description) {
      const accessToken = this.$store.getters['runtime/auth/accessToken']
      const graphClient = clientService.graphAuthenticated(this.configuration.server, accessToken)
      return graphClient.drives
        .updateDrive(space.id, { description } as Drive, {})
        .then(() => {
          this.hideModal()
          this.UPDATE_SPACE_FIELD({
            id: space.id,
            field: 'description',
            value: description
          })
          if (this.$router.currentRoute.name === 'admin-settings-spaces') {
            space.description = description
          }
          this.showMessage({
            title: this.$gettext('Space subtitle was changed successfully')
          })
        })
        .catch((error) => {
          console.error(error)
          this.showMessage({
            title: this.$gettext('Failed to change space subtitle'),
            status: 'danger'
          })
        })
    }
  }
}
