import { mapActions, mapMutations, mapState } from 'vuex'
import { SpaceResource } from 'web-client'
import { unref } from 'vue'

export default {
  computed: {
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
            const allowedCount = this.filterResourcesToRestore(resources).length
            return this.$gettext('Enable (%{count})', { count: allowedCount })
          },
          handler: this.$_restore_trigger,
          isEnabled: ({ resources }) => {
            return !!this.filterResourcesToRestore(resources).length
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

    filterResourcesToRestore(resources): SpaceResource[] {
      return resources.filter((r) => r.canRestore({ user: this.user, ability: this.$ability }))
    },
    $_restore_trigger({ resources }) {
      const allowedResources = this.filterResourcesToRestore(resources)
      if (!allowedResources.length) {
        return
      }
      const message = this.$ngettext(
        'If you enable the selected space, it can be accessed again.',
        'If you enable the %{count} selected spaces, they can be accessed again.',
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
      const graphClient = this.$clientService.graphAuthenticated
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
            return true
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
      return Promise.all(requests).then((result: boolean[]) => {
        if (result.filter(Boolean).length) {
          this.showMessage({
            title: this.$ngettext(
              'Space was restored successfully',
              'Spaces were restored successfully',
              result.filter(Boolean).length
            )
          })
        }
      })
    }
  }
}
