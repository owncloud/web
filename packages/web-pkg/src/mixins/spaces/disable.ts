import { mapActions, mapGetters, mapMutations, mapState } from 'vuex'
import { clientService } from 'web-pkg/src/services'
import { SpaceResource } from 'web-client'
import { unref } from 'vue'

export default {
  computed: {
    ...mapGetters(['configuration']),
    ...mapState(['user']),

    $_disable_items() {
      return [
        {
          name: 'disable',
          icon: 'stop-circle',
          label: ({ resources }) => {
            if(resources.length === 1) {
              return this.$gettext('Disable')
            }
            const allowedCount = resources.filter(r => r.canDisable({ user: this.user })).length
            return this.$gettext('Disable (%{count})', { count: allowedCount})
          },
          handler: this.$_disable_trigger,
          isEnabled: ({ resources }) => {
            return resources.some(r => r.canDisable({ user: this.user }))
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
      const allowedResources = resources.filter(r => r.canDisable({ user: this.user }))
      const message = this.$ngettext(
        'If you disable this space, it can no longer be accessed. Only Space managers will still have access. Note: No files will be deleted from the server.',
        'If you disable these spaces, they can no longer be accessed. Only Space managers will still have access. Note: No files will be deleted from the server.',
        allowedResources.length
      )
      
      const modal = {
        variation: 'danger',
        icon: 'alarm-warning',
        title: this.$ngettext('Disable Space?', 'Disable Spaces?', allowedResources.length),
        cancelText: this.$gettext('Cancel'),
        confirmText: this.$gettext('Disable'),
        message,
        hasInput: false,
        onCancel: this.hideModal,
        onConfirm: () => this.$_disable_disableSpaces(allowedResources)
      }

      this.createModal(modal)
    },

    $_disable_disableSpaces(spaces: SpaceResource[]) {
      const requests = []
      const accessToken = this.$store.getters['runtime/auth/accessToken']
      const graphClient = clientService.graphAuthenticated(this.configuration.server, accessToken)
      spaces.forEach((space) => {
        const request = graphClient.drives
          .deleteDrive(space.id.toString())
          .then(() => {
            this.hideModal()
            const currentRoute = unref(this.$router.currentRoute)
            if (currentRoute.name === 'admin-settings-spaces') {
              space.disabled = true
              space.spaceQuota = { total: space.spaceQuota.total }
            }
            this.UPDATE_SPACE_FIELD({
              id: space.id,
              field: 'disabled',
              value: true
            })
            this.showMessage({
              title: this.$gettext('Space was disabled successfully')
            })
            if (currentRoute.name === 'files-spaces-projects') {
              return
            }
            if (currentRoute.name === 'files-spaces-generic') {
              return this.$router.push({ name: 'files-spaces-projects' })
            }
          })
          .catch((error) => {
            console.error(error)
            this.showMessage({
              title: this.$gettext('Failed to disable space'),
              status: 'danger'
            })
          })
        requests.push(request)
      })
      return Promise.all(requests)
    }
  }
}
