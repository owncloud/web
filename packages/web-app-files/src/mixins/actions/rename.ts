import { mapActions, mapGetters, mapMutations, mapState } from 'vuex'
import { isSameResource, extractNameWithoutExtension } from '../../helpers/resource'
import { isLocationTrashActive, isLocationSharesActive, isLocationSpacesActive } from '../../router'
import { Resource } from 'web-client'
import { dirname, join } from 'path'
import { WebDAV } from 'web-client/src/webdav'
import { SpaceResource } from 'web-client/src/helpers'
import { SHARE_JAIL_ID } from 'files/src/services/folder'

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
        const parentPath = dirname(this.currentFolder.path)
        parentResources = await (this.$clientService.webdav as WebDAV).listFiles(
          space || this.space,
          { path: parentPath }
        )
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

      const exists = this.files.find((file) => file.path === newPath && resource.name !== newName)
      if (exists) {
        const translated = this.$gettext('The name "%{name}" is already taken')
        return this.setModalInputErrorMessage(
          this.$gettextInterpolate(translated, { name: newName }, true)
        )
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
        const hasShareJail = this.capabilities?.spaces?.share_jail === true
        space = space || this.space
        const newPath = join(dirname(resource.path), newName)
        await (this.$clientService.webdav as WebDAV).moveFiles(
          space,
          resource,
          space,
          {
            path: newPath
          },
          {
            hasShareJail,
            shareJailId: SHARE_JAIL_ID
          }
        )
        this.hideModal()

        if (isSameResource(resource, this.currentFolder)) {
          let driveAliasAndItem = this.space.getDriveAliasAndItem({ path: newPath } as Resource)

          if (hasShareJail && resource.isReceivedShare()) {
            driveAliasAndItem = `share/${newName}`
          }

          return this.$router.push({
            params: {
              driveAliasAndItem
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
