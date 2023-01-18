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
          label: ({ resources }) => {
            if (resources.length === 1) {
              return this.$gettext('Enable')
            }
            const allowedCount = resources.filter((r) => r.canRestore({ user: this.user })).length
            return this.$gettext('Enable (%{count})', { count: allowedCount })
          },
          handler: this.$_restore_trigger,
          isEnabled: ({ resources }) => {
            return resources.some((r) => r.canRestore({ user: this.user }))
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
      const allowedResources = resources.filter((r) => r.canRestore({ user: this.user }))
      const message = this.$ngettext(
        'If you enable the selected space, it can be accessed again.',
        'If you disable the %{count} selected spaces, they can be accessed again.',
        allowedResources.length,
        { count: allowedResources.length }
      )
      const confirmText =
        resources.length === 1
          ? this.$gettext('Enable')
          : this.$gettext('Enable (%{count})', { count: allowedResources.length })

      const modal = {
        variation: 'passive',
        title: this.$ngettext('Enable Space?', 'Enable Spaces?', allowedResources.length),
        cancelText: this.$gettext('Cancel'),
        confirmText,
        icon: 'alarm-warning',
        message,
        hasInput: false,
        onCancel: this.hideModal,
        onConfirm: () => this.$_restore_restoreSpaces(allowedResources)
      }

      this.createModal(modal)
    },

    $_restore_restoreSpaces(spaces: SpaceResource[]) {
      const requests = []
      const accessToken = this.$store.getters['runtime/auth/accessToken']
      const graphClient = clientService.graphAuthenticated(this.configuration.server, accessToken)
      spaces.forEach((space) => {
        const request = graphClient.drives
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
          })
          .catch((error) => {
            console.error(error)
            this.showMessage({
              title: this.$gettext('Failed to restore space %{spaceName}', {
                spaceName: space.name
              }),
              status: 'danger'
            })
          })
        requests.push(request)
      })
      return Promise.all(requests).then(() => {
        this.showMessage({
          title: this.$ngettext(
            'Space was restored successfully',
            'Spaces were restored successfully',
            spaces.length
          )
        })
      })
    }
  }
}
