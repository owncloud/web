import { mapActions, mapGetters, mapMutations, mapState } from 'vuex'
import { clientService } from 'web-pkg/src/services'
import { SpaceResource } from 'web-client'
import { unref } from 'vue'

export default {
  computed: {
    ...mapGetters(['configuration']),
    ...mapState(['user']),

    $_restore_items() {
      return [
        {
          name: 'restore',
          icon: 'play-circle',
          label: () => {
            return this.$gettext('Enable')
          },
          handler: this.$_restore_trigger,
          isEnabled: ({ resources }) => {
            if (resources.length !== 1) {
              return false
            }

            return resources[0].canRestore({ user: this.user })
          },
          componentType: 'button',
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
    ...mapMutations('runtime/spaces', ['UPDATE_SPACE_FIELD']),

    $_restore_trigger({ resources }) {
      if (resources.length !== 1) {
        return
      }

      const message = this.$gettextInterpolate(
        this.$gettext('If you enable the space "%{spaceName}", it can be accessed again.'),
        { spaceName: resources[0].name }
      )
      const modal = {
        variation: 'passive',
        title: this.$gettext('Enable Space?'),
        cancelText: this.$gettext('Cancel'),
        confirmText: this.$gettext('Enable'),
        icon: 'alarm-warning',
        message,
        hasInput: false,
        onCancel: this.hideModal,
        onConfirm: () => this.$_restore_restoreSpace(resources[0])
      }

      this.createModal(modal)
    },

    $_restore_restoreSpace(space: SpaceResource) {
      const accessToken = this.$store.getters['runtime/auth/accessToken']
      const graphClient = clientService.graphAuthenticated(this.configuration.server, accessToken)
      return graphClient.drives
        .updateDrive(
          space.id.toString(),
          { name: space.name },
          {
            headers: {
              Restore: true
            }
          }
        )
        .then((updatedSpace) => {
          this.hideModal()
          if (unref(this.$router.currentRoute).name === 'admin-settings-spaces') {
            space.disabled = false
            space.spaceQuota = updatedSpace.data.quota
          }
          this.UPDATE_SPACE_FIELD({
            id: space.id,
            field: 'disabled',
            value: false
          })
          this.showMessage({
            title: this.$gettext('Space was restored successfully')
          })
        })
        .catch((error) => {
          console.error(error)
          this.showMessage({
            title: this.$gettext('Failed to restore space'),
            status: 'danger'
          })
        })
    }
  }
}
