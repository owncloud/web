import { unref } from 'vue'
import { mapActions, mapGetters, mapMutations, mapState } from 'vuex'
import { clientService, eventBus } from 'web-pkg/src/services'

export default {
  computed: {
    ...mapGetters(['configuration']),
    ...mapState(['user']),

    $_delete_items() {
      return [
        {
          name: 'delete',
          icon: 'delete-bin',
          label: () => {
            return this.$gettext('Delete')
          },
          handler: this.$_delete_trigger,
          isEnabled: ({ resources }) => {
            if (resources.length !== 1) {
              return false
            }

            return resources[0].canBeDeleted({ user: this.user })
          },
          componentType: 'button',
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
    ...mapMutations('Files', ['REMOVE_FILES']),
    ...mapMutations('runtime/spaces', ['REMOVE_SPACE']),

    $_delete_trigger({ resources }) {
      if (resources.length !== 1) {
        return
      }

      const modal = {
        variation: 'danger',
        icon: 'alarm-warning',
        title: this.$gettext('Delete space') + ' ' + resources[0].name,
        cancelText: this.$gettext('Cancel'),
        confirmText: this.$gettext('Delete'),
        message: this.$gettext('Are you sure you want to delete this space?'),
        hasInput: false,
        onCancel: this.hideModal,
        onConfirm: () => this.$_delete_deleteSpace(resources[0])
      }

      this.createModal(modal)
    },

    $_delete_deleteSpace(space) {
      const accessToken = this.$store.getters['runtime/auth/accessToken']
      const graphClient = clientService.graphAuthenticated(this.configuration.server, accessToken)
      return graphClient.drives
        .deleteDrive(space.id, '', {
          headers: {
            Purge: 'T'
          }
        })
        .then(() => {
          this.hideModal()
          this.REMOVE_FILES([{ id: space.id }])
          this.REMOVE_SPACE({ id: space.id })
          if (unref(this.$router.currentRoute).name === 'admin-settings-spaces') {
            eventBus.publish('app.admin-settings.list.load')
          }
          this.showMessage({
            title: this.$gettext('Space was deleted successfully')
          })
        })
        .catch((error) => {
          console.error(error)
          this.showMessage({
            title: this.$gettext('Failed to delete space'),
            status: 'danger'
          })
        })
    }
  }
}
