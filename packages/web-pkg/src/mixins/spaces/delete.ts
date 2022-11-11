import { unref } from 'vue'
import { mapActions, mapGetters, mapMutations, mapState } from 'vuex'
import { SpaceResource } from 'web-client/src'
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
          label: ({ resources }) => {
            if (resources.length === 1) {
              return this.$gettext('Delete')
            }
            const allowedCount = this.filterResourcesToDelete(resources).length
            return this.$gettext('Delete (%{count})', { count: allowedCount })
          },
          handler: this.$_delete_trigger,
          isEnabled: ({ resources }) => {
            // CERNBox do not allow actions above home/project root
            const elems = resources[0].path?.split('/').filter(Boolean) || [] //"/eos/project/c/cernbox"
            if (elems.length < 5) {
              return false
            }
            return !!this.filterResourcesToDelete(resources).length
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

    filterResourcesToDelete(resources) {
      return resources.filter((r) => r.canBeDeleted({ user: this.user }))
    },
    $_delete_trigger({ resources }) {
      const allowedResources = this.filterResourcesToDelete(resources)
      if (!allowedResources.length) {
        return
      }
      const message = this.$ngettext(
        'Are you sure you want to delete the selected space?',
        'Are you sure you want to delete %{count} selected spaces?',
        allowedResources.length,
        { count: allowedResources.length }
      )
      const confirmText =
        resources.length === 1
          ? this.$gettext('Delete')
          : this.$gettext('Delete (%{count})', { count: allowedResources.length })
      const modal = {
        variation: 'danger',
        icon: 'alarm-warning',
        title: this.$ngettext('Delete Space?', 'Delete Spaces?', allowedResources.length),
        cancelText: this.$gettext('Cancel'),
        confirmText,
        message: message,
        hasInput: false,
        onCancel: this.hideModal,
        onConfirm: () => this.$_delete_deleteSpaces(allowedResources)
      }

      this.createModal(modal)
    },

    $_delete_deleteSpaces(spaces: SpaceResource[]) {
      const requests = []
      const accessToken = this.$store.getters['runtime/auth/accessToken']
      const graphClient = clientService.graphAuthenticated(this.configuration.server, accessToken)
      spaces.forEach((space) => {
        const request = graphClient.drives
          .deleteDrive(space.id.toString(), '', {
            headers: {
              Purge: 'T'
            }
          })
          .then(() => {
            this.hideModal()
            this.REMOVE_FILES([{ id: space.id }])
            this.REMOVE_SPACE({ id: space.id })
            return true
          })
          .catch((error) => {
            console.error(error)
            this.showMessage({
              title: this.$gettext('Failed to delete space %{spaceName}', {
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
              'Space was deleted successfully',
              'Spaces were deleted successfully',
              result.filter(Boolean).length
            )
          })
        }

        if (unref(this.$router.currentRoute).name === 'admin-settings-spaces') {
          eventBus.publish('app.admin-settings.list.load')
        }
      })
    }
  }
}
