import { mapActions, mapGetters, mapMutations, mapState } from 'vuex'
import { isSameResource, extractNameWithoutExtension } from '../../helpers/resource'
import { getParentPaths } from '../../helpers/path'
import { buildResource } from '../../helpers/resources'
import { isLocationTrashActive, isLocationSharesActive, isLocationSpacesActive } from '../../router'
import { Resource } from 'web-client'
import { dirname, join } from 'path'
import { WebDAV } from 'web-client/src/webdav'
import { SpaceResource } from 'web-client/src/helpers'

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
            if (isLocationTrashActive(this.$router, 'files-trash-generic')) {
              return false
            }
            if (
              isLocationSharesActive(this.$router, 'files-shares-with-me') &&
              this.capabilities?.files_sharing?.can_rename === false
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
                (isLocationSpacesActive(this.$router, 'files-spaces-generic') &&
                  this.space.driveType === 'share' &&
                  resources[0].path === '/'))
            ) {
              return false
            }

            const renameDisabled = resources.some((resource) => {
              return !resource.canRename()
            })
            return !renameDisabled
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
    ...mapMutations('Files', ['RENAME_FILE']),

    async $_rename_trigger({ resources }, space?: SpaceResource) {
      let parentResources
      if (isSameResource(resources[0], this.currentFolder)) {
        const prefix = resources[0].webDavPath.slice(0, -resources[0].path.length)
        const parentPaths = getParentPaths(resources[0].path, false).map((path) => {
          return prefix + path
        })
        const parentPathRoot = parentPaths[0] ?? prefix
        parentResources = await this.$client.files.list(parentPathRoot, 1)
        parentResources = parentResources.map(buildResource)
      }

      const confirmAction = (newName) => {
        if (!this.areFileExtensionsShown) {
          newName = `${newName}.${resources[0].extension}`
        }

        this.$_rename_renameResource(resources[0], newName, space)
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

    async $_rename_renameResource(resource: Resource, newName: string, space?: SpaceResource) {
      this.toggleModalConfirmButton()

      try {
        space = space || this.space
        const newPath = join(dirname(resource.path), newName)
        await (this.$clientService.webdav as WebDAV).moveFiles(space, resource, space, {
          path: newPath
        })
        this.hideModal()

        if (isSameResource(resource, this.currentFolder)) {
          return this.$router.push({
            params: {
              driveAliasAndItem: this.space.getDriveAliasAndItem({ path: newPath } as Resource)
            },
            query: this.$route.query
          })
        }

        this.RENAME_FILE({ space, resource, newPath })
      } catch (error) {
        console.error(error)
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
      }
    }
  }
}
