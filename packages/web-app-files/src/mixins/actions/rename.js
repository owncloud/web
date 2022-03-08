import { mapActions, mapGetters } from 'vuex'

import { isSameResource } from '../../helpers/resource'
import { getParentPaths } from '../../helpers/path'
import { buildResource } from '../../helpers/resources'
import { isLocationTrashActive } from '../../router'

export default {
  computed: {
    ...mapGetters('Files', ['files', 'currentFolder']),

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
            if (
              isLocationTrashActive(this.$router, 'files-trash-personal') ||
              isLocationTrashActive(this.$router, 'files-trash-project')
            ) {
              return false
            }
            if (resources.length !== 1) {
              return false
            }

            const renameDisabled = resources.some((resource) => {
              return !resource.canRename()
            })
            return !renameDisabled
          },
          componentType: 'oc-button',
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
    ...mapActions('Files', ['renameFile']),

    async $_rename_trigger({ resources }) {
      let parentResources
      if (isSameResource(resources[0], this.currentFolder)) {
        const parentPaths = getParentPaths(resources[0].path, false)
        parentResources = await this.$client.files.list(parentPaths[0], 1)
        parentResources = parentResources.map(buildResource)
      }

      const confirmAction = (newName) => {
        this.$_rename_renameResource(resources[0], newName)
      }
      const checkName = (newName) => {
        this.$_rename_checkNewName(resources[0].name, newName, parentResources)
      }

      const title = this.$gettextInterpolate(
        resources[0].isFolder
          ? this.$gettext('Rename folder %{name}')
          : this.$gettext('Rename file %{name}'),
        { name: resources[0].name }
      )
      const modal = {
        variation: 'passive',
        title,
        cancelText: this.$gettext('Cancel'),
        confirmText: this.$gettext('Rename'),
        hasInput: true,
        inputValue: resources[0].name,
        inputLabel: resources[0].isFolder
          ? this.$gettext('Folder name')
          : this.$gettext('File name'),
        onCancel: this.hideModal,
        onConfirm: confirmAction,
        onInput: checkName
      }

      this.createModal(modal)
    },

    $_rename_checkNewName(currentName, newName, parentResources) {
      if (!newName) {
        return this.setModalInputErrorMessage(this.$gettext('The name cannot be empty'))
      }

      if (/[/]/.test(newName)) {
        return this.setModalInputErrorMessage(this.$gettext('The name cannot contain "/"'))
      }

      if (newName === '.') {
        return this.setModalInputErrorMessage(this.$gettext('The name cannot be equal to "."'))
      }

      if (newName === '..') {
        return this.setModalInputErrorMessage(this.$gettext('The name cannot be equal to ".."'))
      }

      if (/\s+$/.test(newName)) {
        return this.setModalInputErrorMessage(this.$gettext('The name cannot end with whitespace'))
      }

      if (!this.flatFileList) {
        const exists = this.files.find((file) => file.name === newName && currentName !== newName)

        if (exists) {
          const translated = this.$gettext('The name "%{name}" is already taken')

          return this.setModalInputErrorMessage(
            this.$gettextInterpolate(translated, { name: newName }, true)
          )
        }
      }

      if (parentResources) {
        const exists = parentResources.find(
          (file) => file.name === newName && currentName !== newName
        )

        if (exists) {
          const translated = this.$gettext('The name "%{name}" is already taken')

          return this.setModalInputErrorMessage(
            this.$gettextInterpolate(translated, { name: newName }, true)
          )
        }
      }

      this.setModalInputErrorMessage(null)
    },

    $_rename_renameResource(resource, newName) {
      this.toggleModalConfirmButton()
      const sameResource = isSameResource(resource, this.currentFolder)

      this.renameFile({
        client: this.$client,
        file: resource,
        newValue: newName,
        publicPage: this.publicPage(),
        isSameResource: sameResource
      })
        .then(() => {
          this.hideModal()

          if (sameResource) {
            const newPath = resource.path.substr(1, resource.path.lastIndexOf('/'))
            this.$router.push({
              params: {
                item: '/' + newPath + newName || '/'
              }
            })
          }
        })
        .catch((error) => {
          this.toggleModalConfirmButton()
          let translated = this.$gettext('Failed to rename "%{file}" to "%{newName}"')
          if (error.statusCode === 423) {
            translated = this.$gettext(
              'Failed to rename "%{file}" to "%{newName}" - the file is locked'
            )
          }
          const title = this.$gettextInterpolate(translated, { file: resource.name, newName }, true)
          this.showMessage({
            title,
            status: 'danger'
          })
        })
    }
  }
}
