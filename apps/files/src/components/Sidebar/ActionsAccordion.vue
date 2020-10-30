<template>
  <div>
    <ul class="uk-list">
      <li v-for="action in enabledActions" :key="action.ariaLabel(highlightedFile)">
        <oc-button
          :aria-Label="action.ariaLabel(highlightedFile)"
          variation="raw"
          @click.stop="action.handler(highlightedFile, action.handlerData)"
        >
          <oc-icon :name="action.icon" aria-hidden="true" size="medium" />
          {{ action.ariaLabel(highlightedFile) }}
        </oc-button>
      </li>
    </ul>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapMutations, mapState } from 'vuex'
import { dirname } from 'path'

import { canBeMoved } from '../../helpers/permissions'
import MixinDeleteResources from '../../mixins/deleteResources'

export default {
  name: 'ActionsAccordion',
  title: $gettext => {
    return $gettext('Actions')
  },
  mixins: [MixinDeleteResources],
  computed: {
    ...mapGetters('Files', [
      'actionsInProgress',
      'activeFiles',
      'selectedFiles',
      'highlightedFile',
      'flatFileList',
      'currentFolder'
    ]),
    ...mapGetters(['capabilities', 'fileSideBars', 'isAuthenticated', 'getToken']),
    ...mapGetters('Files', ['highlightedFile']),
    ...mapState(['apps']),

    // Files lists
    actions() {
      const fileEditorsActions = this.apps.fileEditors.map(editor => {
        if (editor.version === 3) {
          return {
            ariaLabel: () => {
              return `Open in ${editor.title[this.$language.current] || editor.title.en}`
            },
            icon: editor.icon,
            handler: item => this.openFileAction(editor, item.path),
            isEnabled: item => item.extension === editor.extension,
            canBeDefault: true
          }
        }

        return {
          ariaLabel: () => {
            return `Open in ${this.apps.meta[editor.app].name}`
          },
          icon: this.apps.meta[editor.app].icon,
          handler: item => this.openFileAction(editor, item.path),
          isEnabled: item => item.extension === editor.extension,
          canBeDefault: true
        }
      })
      const systemActions = [
        {
          icon: 'remove_red_eye',
          handler: file => this.fetchFile(file.path, 'application/pdf'),
          ariaLabel: () => {
            return this.$gettext('Open in browser')
          },
          isEnabled: function(item) {
            return item.extension === 'pdf'
          },
          canBeDefault: true
        },
        {
          icon: 'file_download',
          handler: this.downloadFile,
          ariaLabel: () => {
            return this.$gettext('Download')
          },
          isEnabled: function(item) {
            return item.canDownload()
          },
          canBeDefault: true
        },
        {
          icon: 'star',
          handler: this.toggleFileFavorite,
          ariaLabel: item => {
            if (item.starred) {
              return this.$gettext('Unmark as favorite')
            }
            return this.$gettext('Mark as favorite')
          },
          isEnabled: () => {
            return (
              this.isAuthenticated && this.capabilities.files && this.capabilities.files.favorites
            )
          }
        },
        {
          icon: 'edit',
          ariaLabel: () => {
            return this.$gettext('Rename')
          },
          handler: this.$_fileActions_displayRenameDialog,
          isEnabled: function(item, parent) {
            if (parent && !parent.canRename()) {
              return false
            }
            return item.canRename()
          }
        },
        {
          icon: 'file_copy',
          handler: resource => {
            // Parent of the resource selected for copy used as a default target location
            const parent = dirname(resource.path)
            this.$router.push({
              name: 'location-picker',
              query: { action: 'copy', target: parent, resource: resource.path }
            })
          },
          ariaLabel: () => this.$gettext('Copy'),
          isEnabled: () => {
            if (this.publicPage()) {
              return this.currentFolder.canCreate()
            }

            return true
          }
        },
        {
          icon: 'folder-move',
          handler: resource => {
            // Parent of the resource selected for move used as a default target location
            const parent = dirname(resource.path)
            this.$router.push({
              name: 'location-picker',
              query: { action: 'move', target: parent, resource: resource.path }
            })
          },
          ariaLabel: () =>
            this.$pgettext(
              'Action in the files list row to initiate move of a single resource',
              'Move'
            ),
          isEnabled: resource => canBeMoved(resource, this.currentFolder.path)
        },
        {
          icon: 'delete',
          ariaLabel: () => {
            return this.$gettext('Delete')
          },
          handler: this.$_fileActions_deleteResource,
          isEnabled: function(item, parent) {
            if (parent && !parent.canBeDeleted()) {
              return false
            }
            return item.canBeDeleted()
          }
        }
      ]

      return fileEditorsActions.concat(systemActions)
    },

    enabledActions() {
      if (this.$route.name === 'files-trashbin') {
        return this.actionsTrashbin
      }

      return this.actions.filter(action => action.isEnabled(this.highlightedFile))
    },

    actionsTrashbin() {
      return [
        {
          icon: 'restore',
          ariaLabel: () => this.$gettext('Restore'),
          handler: this.restoreDeletedResource,
          isEnabled: () => true
        },
        {
          icon: 'delete',
          ariaLabel: () => this.$gettext('Delete'),
          handler: this.removeSingleResourceFromTrashbin,
          isEnabled: () => true
        }
      ]
    }
  },
  methods: {
    ...mapActions('Files', [
      'renameFile',
      'markFavorite',
      'resetFileSelection',
      'addFileSelection',
      'setHighlightedFile'
    ]),
    ...mapActions([
      'showMessage',
      'createModal',
      'hideModal',
      'setModalInputErrorMessage',
      'openFile'
    ]),
    ...mapMutations('Files', ['SET_RESOURCES_SELECTION_FOR_MOVE']),

    toggleFileFavorite(file) {
      this.markFavorite({
        client: this.$client,
        file: file
      }).catch(() => {
        const translated = this.$gettext('Error while starring "%{file}"')
        const title = this.$gettextInterpolate(translated, { file: file.name }, true)
        this.showMessage({
          title: title,
          status: 'danger',
          autoClose: {
            enabled: true
          }
        })
      })
    },

    $_fileActions_deleteResource(resource) {
      this.$_deleteResources_displayDialog(resource, true)
    },

    navigateTo(param) {
      if (this.searchTerm !== '' && this.$route.params.item === param) {
        this.resetSearch()
      }
      let route = 'files-list'
      if (this.publicPage()) {
        route = 'public-files'
      }
      this.$router.push({
        name: route,
        params: {
          item: param
        }
      })
    },

    $_fileActions_renameResource(resource, newName) {
      this.toggleModalConfirmButton()

      this.renameFile({
        client: this.$client,
        file: resource,
        newValue: newName,
        publicPage: this.publicPage()
      })
        .then(() => {
          this.hideModal()
        })
        .catch(error => {
          this.toggleModalConfirmButton()
          let translated = this.$gettext('Error while renaming "%{file}" to "%{newName}"')
          if (error.statusCode === 423) {
            translated = this.$gettext(
              'Error while renaming "%{file}" to "%{newName}" - the file is locked'
            )
          }
          const title = this.$gettextInterpolate(
            translated,
            { file: resource.name, newName: newName },
            true
          )
          this.showMessage({
            title: title,
            status: 'danger',
            autoClose: {
              enabled: true
            }
          })
        })
    },

    $_fileActions_renameDialog_checkNewName(currentName, newName) {
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
        const exists = this.activeFiles.find(n => {
          if (n.name === newName && currentName !== newName) {
            return n
          }
        })

        if (exists) {
          const translated = this.$gettext('The name "%{name}" is already taken')

          return this.setModalInputErrorMessage(
            this.$gettextInterpolate(translated, { name: newName }, true)
          )
        }
      }

      this.setModalInputErrorMessage(null)
    },

    $_fileActions_displayRenameDialog(resource) {
      const isFolder = resource.type === 'folder'
      const confirmAction = newName => {
        this.$_fileActions_renameResource(resource, newName)
      }
      const checkName = newName => {
        this.$_fileActions_renameDialog_checkNewName(resource.name, newName)
      }

      const modal = {
        variation: 'info',
        title: isFolder
          ? this.$gettext('Rename folder ') + resource.name
          : this.$gettext('Rename file ' + resource.name),
        cancelText: this.$gettext('Cancel'),
        confirmText: this.$gettext('Rename'),
        hasInput: true,
        inputValue: resource.name,
        inputPlaceholder: isFolder
          ? this.$gettext('Enter new folder name…')
          : this.$gettext('Enter new file name…'),
        inputLabel: isFolder ? this.$gettext('Folder name') : this.$gettext('File name'),
        onCancel: this.hideModal,
        onConfirm: confirmAction,
        onInput: checkName
      }

      this.createModal(modal)
    },

    openBlobInNewTab(blob, mimetype) {
      // It is necessary to create a new blob object with mime-type explicitly set
      // otherwise only Chrome works like it should
      const newBlob = new Blob([blob], { type: mimetype })

      // Open the file in new tab
      const data = window.URL.createObjectURL(newBlob)
      window.open(data, '_blank')
    },

    fetchFile(filePath, mimetype) {
      const url = this.$client.helpers._webdavUrl + filePath
      const headers = new Headers()

      headers.append('Authorization', 'Bearer ' + this.getToken)
      headers.append('X-Requested-With', 'XMLHttpRequest')

      fetch(url, {
        method: 'GET',
        headers
      })
        .then(r => r.blob())
        .then(blob => this.openBlobInNewTab(blob, mimetype))
    },

    openFileAction(action, filePath) {
      // TODO: Refactor in the store
      this.openFile({
        filePath: filePath
      })

      if (action.version === 3) {
        // TODO: replace more placeholder in the final version
        const finalUrl = action.url
          .replace('{PATH}', encodeURIComponent(filePath.path))
          .replace('{FILEID}', encodeURIComponent(filePath.id))
        const win = window.open(finalUrl, '_blank')
        // in case popup is blocked win will be null
        if (win) {
          win.focus()
        }
        return
      }
      if (action.newTab) {
        const path = this.$router.resolve({
          name: action.routeName,
          params: { filePath: filePath }
        }).href
        const url = window.location.origin + '/' + path
        const target = `${action.routeName}-${filePath}`
        const win = window.open(url, target)
        // in case popup is blocked win will be null
        if (win) {
          win.focus()
        }
        return
      }

      const routeName = action.routeName ? action.app + '/' + action.routeName : action.app
      const params = {
        filePath,
        contextRouteName: this.$route.name
      }

      this.$router.push({
        name: routeName,
        params
      })
    },

    restoreDeletedResource(resource) {
      this.resetFileSelection()
      this.addFileSelection(resource)
      this.$client.fileTrash
        .restore(resource.id, resource.originalLocation)
        .then(() => {
          this.removeFilesFromTrashbin([resource])
          const translated = this.$gettext('%{file} was restored successfully')
          this.showMessage({
            title: this.$gettextInterpolate(translated, { file: resource.name }, true),
            autoClose: {
              enabled: true
            }
          })
        })
        .catch(error => {
          const translated = this.$gettext('Restoration of %{file} failed')
          this.showMessage({
            title: this.$gettextInterpolate(translated, { file: resource.name }, true),
            desc: error.message,
            status: 'danger',
            autoClose: {
              enabled: true
            }
          })
        })
      this.resetFileSelection()
      this.setHighlightedFile(null)
    },

    removeSingleResourceFromTrashbin(resource) {
      this.$_deleteResources_displayDialog(resource, true)
    }
  }
}
</script>
