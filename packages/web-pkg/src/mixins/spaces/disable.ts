import { mapActions, mapMutations, mapState } from 'vuex'
import { SpaceResource } from 'web-client'
import { unref } from 'vue'

export default {
  computed: {
    ...mapState(['user']),

    $_disable_items() {
      return [
        {
          name: 'disable',
          icon: 'stop-circle',
          label: ({ resources }) => {
            if (resources.length === 1) {
              return this.$gettext('Disable')
            }
            const allowedCount = this.filterResourcesToDisable(resources).length
            return this.$gettext('Disable (%{count})', { count: allowedCount })
          },
          handler: this.$_disable_trigger,
          isEnabled: ({ resources }) => {
            return !!this.filterResourcesToDisable(resources).length
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

    filterResourcesToDisable(resources): SpaceResource[] {
      return resources.filter((r) => r.canDisable({ user: this.user, ability: this.$ability }))
    },
    $_disable_trigger({ resources }) {
      const allowedResources = this.filterResourcesToDisable(resources)
      if (!allowedResources.length) {
        return
      }
      const message = this.$ngettext(
        'If you disable the selected space, it can no longer be accessed. Only Space managers will still have access. Note: No files will be deleted from the server.',
        'If you disable the %{count} selected spaces, they can no longer be accessed. Only Space managers will still have access. Note: No files will be deleted from the server.',
        allowedResources.length,
        { count: allowedResources.length }
      )
      const confirmText =
        resources.length === 1
          ? this.$gettext('Disable')
          : this.$gettext('Disable (%{count})', { count: allowedResources.length })
      const modal = {
        variation: 'danger',
        icon: 'alarm-warning',
        title: this.$ngettext('Disable Space?', 'Disable Spaces?', allowedResources.length),
        cancelText: this.$gettext('Cancel'),
        confirmText,
        message,
        hasInput: false,
        onCancel: this.hideModal,
        onConfirm: () => this.$_disable_disableSpaces(allowedResources)
      }

      this.createModal(modal)
    },

    $_disable_disableSpaces(spaces: SpaceResource[]) {
      const requests = []
      const graphClient = this.$clientService.graphAuthenticated
      const currentRoute = unref(this.$router.currentRoute)
      spaces.forEach((space) => {
        const request = graphClient.drives
          .deleteDrive(space.id.toString())
          .then(() => {
            this.hideModal()
            if (currentRoute.name === 'admin-settings-spaces') {
              space.disabled = true
              space.spaceQuota = { total: space.spaceQuota.total }
            }
            this.UPDATE_SPACE_FIELD({
              id: space.id,
              field: 'disabled',
              value: true
            })
            return true
          })
          .catch((error) => {
            console.error(error)
            this.showMessage({
              title: this.$gettext('Failed to disable space %{spaceName}', {
                spaceName: space.name
              }),
              status: 'danger'
            })
          })
        requests.push(request)
      })
      return Promise.all(requests).then((result: boolean[]) => {
        if (result.filter(Boolean).length) {
          this.showMessage({
            title: this.$ngettext(
              'Space was disabled successfully',
              'Spaces were disabled successfully',
              result.filter(Boolean).length
            )
          })
        }

        if (currentRoute.name === 'files-spaces-generic') {
          return this.$router.push({ name: 'files-spaces-projects' })
        }
      })
    }
  }
}
