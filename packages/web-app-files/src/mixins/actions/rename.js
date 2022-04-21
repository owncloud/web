import { mapActions, mapGetters, mapState } from 'vuex'
import { isSameResource, extractNameWithoutExtension } from '../../helpers/resource'
import { getParentPaths } from '../../helpers/path'
import { buildResource } from '../../helpers/resources'
import {
  isLocationTrashActive,
  isLocationSharesActive,
  isLocationSpacesActive,
  isLocationCommonActive
} from '../../router'

export default {
  computed: {
    ...mapGetters('Files', ['files', 'currentFolder']),
    ...mapGetters(['capabilities']),
    ...mapState('Files', ['areFileExtensionsShown']),

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
              isLocationTrashActive(this.$router, 'files-trash-spaces-project')
            ) {
              return false
            }
            if (
              isLocationSharesActive(this.$router, 'files-shares-with-me') &&
              this.capabilities?.files_sharing?.can_rename === false
            ) {
              return false
            }
            if (
              isLocationCommonActive(this.$router, 'files-common-projects-trash') ||
              isLocationCommonActive(this.$router, 'files-common-projects')
            ) {
              return false
            }
            if (resources.length !== 1) {
              return false
            }
            // FIXME: once renaming shares in share_jail has been sorted out backend side we can enable renaming shares again
            if (
              this.capabilities?.spaces?.share_jail === true &&
              (isLocationSharesActive(this.$router, 'files-shares-with-me') ||
                (isLocationSpacesActive(this.$router, 'files-spaces-share') &&
                  resources[0].path === '/'))
            ) {
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
        const prefix = resources[0].webDavPath.slice(0, -resources[0].path.length)
        const parentPaths = getParentPaths(resources[0].path, false).map((path) => {
          return prefix + path
        })
        parentResources = await this.$client.files.list(parentPaths[0], 1)
        parentResources = parentResources.map(buildResource)
      }

      const confirmAction = (newName) => {
        if (!this.areFileExtensionsShown) {
          newName = `${newName}.${resources[0].extension}`
        }

        this.$_rename_renameResource(resources[0], newName)
      }
      const checkName = (newName) => {
        if (!this.areFileExtensionsShown) {
          newName = `${newName}.${resources[0].extension}`
        }
        this.$_rename_checkNewName(resources[0], newName, parentResources)
      }
      const nameWithoutExtension = extractNameWithoutExtension(resources[0])
      const modalTitle =
        !resources[0].isFolder && !this.areFileExtensionsShown
          ? nameWithoutExtension
          : resources[0].name

      const title = this.$gettextInterpolate(
        resources[0].isFolder
          ? this.$gettext('Rename folder %{name}')
          : this.$gettext('Rename file %{name}'),
        { name: modalTitle }
      )

      const inputValue =
        !resources[0].isFolder && !this.areFileExtensionsShown
          ? nameWithoutExtension
          : resources[0].name

      const inputSelectionRange =
        resources[0].isFolder || !this.areFileExtensionsShown
          ? null
          : [0, nameWithoutExtension.length]

      const modal = {
        variation: 'passive',
        title,
        cancelText: this.$gettext('Cancel'),
        confirmText: this.$gettext('Rename'),
        hasInput: true,
        inputValue,
        inputSelectionRange,
        inputLabel: resources[0].isFolder
          ? this.$gettext('Folder name')
          : this.$gettext('File name'),
        onCancel: this.hideModal,
        onConfirm: confirmAction,
        onInput: checkName
      }

      this.createModal(modal)
    },

    $_rename_checkNewName(resource, newName, parentResources) {
      const newPath =
        resource.path.substring(0, resource.path.length - resource.name.length) + newName

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
        const exists = this.files.find((file) => file.path === newPath && resource.name !== newName)

        if (exists) {
          const translated = this.$gettext('The name "%{name}" is already taken')

          return this.setModalInputErrorMessage(
            this.$gettextInterpolate(translated, { name: newName }, true)
          )
        }
      }

      if (parentResources) {
        const exists = parentResources.find(
          (file) => file.path === newPath && resource.name !== newName
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
            const newPath = resource.path.slice(1, resource.path.lastIndexOf('/') + 1)
            this.$router.push({
              params: {
                item: '/' + newPath + newName || '/'
              },
              query: this.$route.query
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
