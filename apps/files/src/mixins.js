import filesize from 'filesize'
import moment from 'moment'
import FileUpload from './FileUpload.js'
import fileTypeIconMappings from './fileTypeIconMappings.json'
import { mapActions, mapGetters } from 'vuex'

export default {
  filters: {
    fileSize (int) {
      if (int < 0) {
        return ''
      }
      if (isNaN(int)) {
        return '?'
      }
      return filesize(int, {
        round: 2
      })
    }
  },
  data: () => ({
    selectedFile: ''
  }),
  computed: {
    ...mapGetters('Files', ['searchTerm', 'inProgress', 'files']),

    _renameDialogTitle () {
      let translated

      if (this.selectedFile.type === 'folder') {
        translated = this.$gettext('Rename folder %{name}')
      } else {
        translated = this.$gettext('Rename file %{name}')
      }
      return this.$gettextInterpolate(translated, { name: this.selectedFile.name }, true)
    }
  },
  methods: {
    ...mapActions('Files', ['resetSearch', 'addFileToProgress', 'setOverwriteDialogTitle', 'setOverwriteDialogMessage']),
    ...mapActions(['showMessage']),

    formDateFromNow (date) {
      return moment(date).locale(this.$language.current).fromNow()
    },
    navigateTo (route, param) {
      if (this.searchTerm !== '' && this.$route.params.item === param) {
        this.resetSearch()
      }
      this.$router.push({
        name: route,
        params: {
          item: param
        }
      })
    },
    changeName (item) {
      this.changeFileName = !this.changeFileName
      if (typeof item === 'object') {
        this.originalName = item.name
        this.selectedFile = item
        this.newName = item.name
        item = this.newName
        return
      }
      if (this.selectedFile.name === item) {
        // The name has to be resetted a little while later to prevent
        // showing the error druing the fade out animation of dialog
        setTimeout(_ => {
          this.originalName = null
        }, 1000)
        return
      }

      this.renameFile({
        client: this.$client,
        file: this.selectedFile,
        newValue: item
      }).then(setTimeout(_ => {
        this.originalName = null
      }, 1000))
    },

    downloadFile (file) {
      const url = this.$client.files.getFileUrl(file.path)
      const anchor = document.createElement('a')

      const headers = new Headers()
      headers.append('Authorization', 'Bearer ' + this.getToken)

      fetch(url, { headers })
        .then(response => response.blob())
        .then(blobby => {
          if (window.navigator && window.navigator.msSaveOrOpenBlob) { // for IE
            window.navigator.msSaveOrOpenBlob(blobby, file.name)
          } else { // for Non-IE (chrome, firefox etc.)
            const objectUrl = window.URL.createObjectURL(blobby)

            anchor.href = objectUrl
            anchor.download = file.name
            anchor.click()

            window.URL.revokeObjectURL(objectUrl)
          }
        })
        .catch(error => console.log(error))
    },
    fileTypeIcon (file) {
      if (file) {
        if (file.type === 'folder') {
          return 'folder'
        }
        const icon = fileTypeIconMappings[file.extension]
        if (icon) return `${icon}`
      }
      return 'x-office-document'
    },
    label (string) {
      const cssClass = ['uk-label']

      switch (parseInt(string)) {
        case 1:
          cssClass.push('uk-label-danger')
          break
        case 2:
          cssClass.push('uk-label-warning')
          break
        default:
          cssClass.push('uk-label-success')
      }

      return '<span class="' + cssClass.join(' ') + '">' + string + '</span>'
    },
    checkIfBrowserSupportsFolderUpload () {
      const el = document.createElement('input')
      el.type = 'file'
      return typeof el.webkitdirectory !== 'undefined' || typeof el.mozdirectory !== 'undefined' || typeof el.directory !== 'undefined'
    },
    checkIfElementExists (element) {
      const name = element.name || element
      return this.files.find((n) => {
        if (n['name'] === name) {
          return n
        }
      })
    },
    processDirectoryEntryRecursively (directory) {
      this.$client.files.createFolder(directory.fullPath).then(() => {
        const directoryReader = directory.createReader()
        const ctrl = this
        directoryReader.readEntries(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isDirectory) {
              ctrl.processDirectoryEntryRecursively(entry)
            } else {
              entry.file(file => {
                ctrl.$_ocUpload(file, entry.fullPath, null, false)
              })
            }
          })
        })
      })
    },
    async $_ocUpload_addDropToQue (e) {
      const items = e.dataTransfer.items || e.dataTransfer.files

      // A list of files is being dropped ...
      if (items instanceof FileList) {
        this.$_ocUpload_addDirectoryToQue(e)
        return
      }
      for (let item of items) {
        item = item.webkitGetAsEntry()
        const exists = this.checkIfElementExists(item)
        if (item.isDirectory) {
          if (!exists) {
            this.processDirectoryEntryRecursively(item).then(() => {
              this.$emit('success', null, item.name)
            })
          } else {
            this.showMessage({
              title: this.$gettextInterpolate(this.$gettext('Folder %{folder} already exists.'), { folder: item.name }, true),
              status: 'danger'
            })
          }
        } else {
          if (!exists) {
            item.file(file => {
              this.$_ocUpload(file, item.fullPath)
            })
          } else {
            const translated = this.$gettext('File %{file} already exists.')
            this.setOverwriteDialogTitle(this.$gettextInterpolate(translated, { file: item.name }, true))
            this.setOverwriteDialogMessage(this.$gettext('Do you want to overwrite it?'))
            const overwrite = await this.$_ocUpload_confirmOverwrite()
            if (overwrite) {
              item.file(file => {
                this.$_ocUpload(file, item.fullPath, exists.etag)
              })
            }
            this.setOverwriteDialogMessage(null)
          }
        }
      }
    },
    async $_ocUpload_addFileToQue (e) {
      const files = e.target.files
      if (!files.length) return
      for (let i = 0; i < files.length; i++) {
        const exists = this.checkIfElementExists(files[i])
        if (!exists) {
          this.$_ocUpload(files[i], files[i].name)
          if ((i + 1) === files.length) this.$_ocUploadInput_clean()
          continue
        }

        const translated = this.$gettext('File %{file} already exists.')
        this.setOverwriteDialogTitle(this.$gettextInterpolate(translated, { file: files[i].name }, true))
        this.setOverwriteDialogMessage(this.$gettext('Do you want to overwrite it?'))
        const overwrite = await this.$_ocUpload_confirmOverwrite()
        if (overwrite === true) {
          this.$_ocUpload(files[i], files[i].name, exists.etag)
          if ((i + 1) === files.length) this.$_ocUploadInput_clean()
        } else {
          if ((i + 1) === files.length) this.$_ocUploadInput_clean()
        }
        this.setOverwriteDialogMessage(null)
      }
    },
    $_ocUpload_addDirectoryToQue (e) {
      const files = e.target.files || e.dataTransfer.files
      if (!files.length) return

      // Check if base directory exists
      let directoryPath = files[0].webkitRelativePath.replace('/' + files[0].name, '')
      const directoryName = directoryPath.split('/')[0]
      const directoryExists = this.checkIfElementExists(directoryName)

      if (directoryExists) {
        this.showMessage({
          title: this.$gettextInterpolate(this.$gettext('Folder %{folder} already exists.'), { folder: directoryName }, true),
          status: 'danger'
        })
      } else {
        // Get folder structure
        const directoriesToCreate = []
        for (const file of files) {
          directoryPath = file.webkitRelativePath.replace('/' + file.name, '')
          const directories = directoryPath.split('/')
          for (let i = 0; i < directories.length; i++) {
            const directoryName = directories[i]
            directories[i] = ''
            for (let temp = directories.length - 1 - i; temp < directories.length - 1; temp++) {
              directories[i] += directories[temp] + '/'
            }
            directories[i] += directoryName
            if (!directoriesToCreate.includes(directories[i])) {
              directoriesToCreate.push(directories[i])
            }
          }
        }
        // Create folder structure
        const createFolderPromises = []
        const rootDir = directoriesToCreate[0]
        for (const directory of directoriesToCreate) {
          createFolderPromises.push(this.$client.files.createFolder(directory))
        }
        // Upload files
        const uploadPromises = []
        Promise.all(createFolderPromises).then(() => {
          for (const file of files) {
            uploadPromises.push(this.$_ocUpload(file, file.webkitRelativePath, null, false))
          }
          // once all files are uploaded we emit the success event
          Promise.all(uploadPromises).then(() => {
            this.$emit('success', null, rootDir)
            this.$_ocUploadInput_clean()
          })
        })
      }
    },
    $_ocUpload_confirmOverwrite () {
      return new Promise(resolve => {
        const confirmButton = document.querySelector('#files-overwrite-confirm')
        const cancelButton = document.querySelector('#files-overwrite-cancel')
        confirmButton.addEventListener('click', _ => {
          resolve(true)
        })
        cancelButton.addEventListener('click', _ => {
          resolve(false)
        })
      })
    },
    $_ocUpload (file, path, overwrite = null, emitSuccess = true) {
      this.addFileToProgress(file)
      const fileUpload = new FileUpload(file, path, this.url, this.headers, this.$_ocUpload_onProgress, this.requestType)
      return fileUpload
        .upload({
          overwrite: overwrite
        })
        .then(e => {
          if (emitSuccess) {
            this.$emit('success', e, file)
          }
        })
        .catch(e => {
          this.$emit('error', e)
        })
    },
    $_ocUpload_onProgress (e, file) {
      const progress = parseInt(e.loaded * 100 / e.total)
      this.$emit('progress', {
        fileName: file.name,
        progress
      })
    },
    $_ocUploadInput_clean () {
      const input = this.$refs.input
      if (input) {
        input.value = ''
      }
    }
  }
}
