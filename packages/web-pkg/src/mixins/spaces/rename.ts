import { unref } from 'vue'
import { mapActions, mapGetters, mapMutations } from 'vuex'
import { clientService } from 'web-pkg/src/services'

export default {
  computed: {
    ...mapGetters(['configuration', 'user']),

    $_rename_items() {
      return [
        {
          name: 'rename',
          icon: 'pencil',
          label: () => {
            return this.$gettext('Rename')
          },
          handler: this.$_rename_trigger,
          isEnabled: ({ resources }) => {
            if (resources.length !== 1) {
              return false
            }
            // CERNBox do not allow actions above home/project root
            const elems = resources[0].path?.split('/').filter(Boolean) || [] //"/eos/project/c/cernbox"
            if (elems.length < 5) {
              return false
            }

            return resources[0].canRename({ user: this.user })
          },
          componentType: 'button',
          class: 'oc-files-actions-rename-trigger'
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

    $_rename_trigger({ resources }) {
      if (resources.length !== 1) {
        return
      }

      const modal = {
        variation: 'passive',
        title: this.$gettext('Rename space') + ' ' + resources[0].name,
        cancelText: this.$gettext('Cancel'),
        confirmText: this.$gettext('Rename'),
        hasInput: true,
        inputLabel: this.$gettext('Space name'),
        inputValue: resources[0].name,
        onCancel: this.hideModal,
        onConfirm: (name) => this.$_rename_renameSpace(resources[0], name),
        onInput: this.$_rename_checkName
      }

      this.createModal(modal)
    },

    $_rename_checkName(name) {
      if (name.trim() === '') {
        return this.setModalInputErrorMessage(this.$gettext('Space name cannot be empty'))
      }
      if (name.length > 255) {
        return this.setModalInputErrorMessage(
          this.$gettext('Space name cannot exceed 255 characters')
        )
      }
      if (/[/\\.:?*"><|]/.test(name)) {
        return this.setModalInputErrorMessage(
          this.$gettext('Space name cannot contain the following characters: / \\ . : ? * " > < |')
        )
      }
      return this.setModalInputErrorMessage(null)
    },

    $_rename_renameSpace(space, name) {
      const accessToken = this.$store.getters['runtime/auth/accessToken']
      const graphClient = clientService.graphAuthenticated(this.configuration.server, accessToken)
      return graphClient.drives
        .updateDrive(space.id, { name }, {})
        .then(() => {
          this.hideModal()
          if (unref(this.$router.currentRoute).name === 'admin-settings-spaces') {
            space.name = name
          }
          this.UPDATE_SPACE_FIELD({
            id: space.id,
            field: 'name',
            value: name
          })
          this.showMessage({
            title: this.$gettext('Space name was changed successfully')
          })
        })
        .catch((error) => {
          console.error(error)
          this.showMessage({
            title: this.$gettext('Failed to rename space'),
            status: 'danger'
          })
        })
    }
  }
}
