import { mapActions, mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters('Files', [
      'renameDialogSelectedFile', 'renameDialogOpen', 'renameDialogNewName', 'renameDialogOriginalName',
      'deleteDialogOpen', 'deleteDialogSelectedFiles',
      'actionsInProgress', 'activeFiles', 'selectedFiles', 'highlightedFile'
    ]),
    ...mapGetters(['capabilities', 'fileSideBars']),
    // Files lists
    actions () {
      const actions = [
        {
          icon: 'edit',
          ariaLabel: this.$gettext('Rename'),
          handler: this.promptFileRename,
          isEnabled: function (item, parent) {
            if (parent && !parent.canRename()) {
              return false
            }
            return item.canRename()
          }
        },
        {
          icon: 'file_download',
          handler: this.downloadFile,
          ariaLabel: this.$gettext('Download'),
          isEnabled: function (item) {
            return item.canDownload()
          }
        },
        {
          icon: 'delete',
          ariaLabel: this.$gettext('Delete'),
          handler: this.deleteFile,
          isEnabled: function (item, parent) {
            if (parent && !parent.canBeDeleted()) {
              return false
            }
            return item.canBeDeleted()
          }
        }
      ]
      // FIXME: we are assuming this.fileSideBars and others are available on object
      for (const sideBar of this.fileSideBars) {
        if (sideBar.enabled !== undefined && !sideBar.enabled(this.capabilities)) {
          continue
        }
        if (sideBar.quickAccess) {
          actions.push({
            icon: sideBar.quickAccess.icon,
            ariaLabel: sideBar.quickAccess.ariaLabel,
            handler: this.openSideBar,
            handlerData: sideBar.app,
            isEnabled: function (item) {
              return true
            }
          })
        }
      }

      return actions
    }
  },
  methods: {
    ...mapActions('Files', [
      'renameFile', 'promptFileRename', 'closePromptFileRename',
      'deleteFiles', 'promptFileDelete', 'closePromptFileDelete'
    ]),
    ...mapActions(['showMessage']),

    actionInProgress (item) {
      return this.actionsInProgress.some(itemInProgress => itemInProgress.id === item.id)
    },

    disabledActionTooltip (item) {
      if (this.actionInProgress(item)) {
        if (item.type === 'folder') {
          return this.$gettext('There is currently an action in progress for this folder')
        }

        return this.$gettext('There is currently an action in progress for this file')
      }

      return null
    },

    cancelRenameFile () {
      this.closePromptFileRename()
    },

    doRenameFile (newName) {
      this.renameFile({
        client: this.$client,
        // selected file from prompt
        file: this.renameDialogSelectedFile,
        newValue: newName,
        publicPage: this.publicPage()
      }).then(() => {
        this.closePromptFileRename()
      }).catch(error => {
        let translated = this.$gettext('Error while renaming "%{file}" to "%{newName}"')
        if (error.statusCode === 423) {
          translated = this.$gettext('Error while renaming "%{file}" to "%{newName}" - the file is locked')
        }
        const title = this.$gettextInterpolate(translated, { file: this.renameDialogSelectedFile.name, newName: newName }, true)
        this.showMessage({
          title: title,
          status: 'danger'
        })
        this.closePromptFileRename()
      })
    },

    cancelDeleteFile () {
      this.closePromptFileDelete()
    },

    deleteFile (file) {
      const translated = this.$gettext('Please confirm the deletion of %{ fileName }')
      this.promptFileDelete({
        message: this.$gettextInterpolate(translated, { fileName: file.name }, true),
        items: file
      })
    },
    reallyDeleteFiles () {
      let files = this.deleteDialogSelectedFiles ? this.deleteDialogSelectedFiles : this.selectedFiles
      if (!Array.isArray(files)) {
        files = [files]
      }
      this.deleteFiles({
        client: this.$client,
        files: files,
        publicPage: this.publicPage(),
        $gettext: this.$gettext,
        $gettextInterpolate: this.$gettextInterpolate
      }).then(() => {
        this.closePromptFileDelete()
        this.setHighlightedFile(null)
      }).catch(error => {
        console.log(error)
        this.closePromptFileDelete()
      })
    },

    validateFileName (name) {
      if (/[/]/.test(name)) return this.$gettext('The name cannot contain "/"')

      if (name === '.') return this.$gettext('The name cannot be equal to "."')

      if (name === '..') return this.$gettext('The name cannot be equal to ".."')

      if (/\s+$/.test(name)) return this.$gettext('The name cannot end with whitespace')

      if (!this.flatFileList) {
        const exists = this.activeFiles.find((n) => {
          if (n.name === name && this.renameDialogOriginalName !== name) {
            return n
          }
        })

        if (exists) {
          const translated = this.$gettext('The name "%{name}" is already taken')
          return this.$gettextInterpolate(translated, { name: name }, true)
        }
      }
      return null
    },
    // Files lists
    openFileActionBar (file) {
      this.$emit('FileAction', file)
    },
    openSideBar (file, sideBarName) {
      this.$emit('sideBarOpen', file, sideBarName)
    },
    navigateTo (param) {
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
    openFileAction (action, filePath) {
      if (action.newTab) {
        const path = this.$router.resolve({ name: action.routeName, params: { filePath: filePath } }).href
        const url = window.location.origin + '/' + path
        const target = `${action.routeName}-${filePath}`
        const win = window.open(url, target)
        // in case popup is blocked win will be null
        if (win) {
          win.focus()
        }
        return
      }
      // TODO: rewire code below ....
      const appId = action.app
      // TODO path to state
      this.$router.push({
        name: appId
      })
    }
  }
}
