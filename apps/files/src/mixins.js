import filesize from 'filesize'
import pathUtil from 'path'
import moment from 'moment'
import fileTypeIconMappings from './fileTypeIconMappings.json'
import { mapActions, mapGetters } from 'vuex'
const { default: PQueue } = require('p-queue')

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
    },

    roundNumber (int) {
      return parseInt(int.toFixed(0))
    }
  },
  data: () => ({
    uploadQueue: new PQueue({ concurrency: 1 }),
    directoryQueue: new PQueue({ concurrency: 1 }),
    uploadFileUniqueId: 0
  }),
  computed: {
    ...mapGetters('Files', ['searchTerm', 'files', 'highlightedFile', 'publicLinkPassword']),
    ...mapGetters(['getToken']),

    _sidebarOpen () {
      return this.highlightedFile !== null
    }
  },
  methods: {
    ...mapActions('Files', ['resetSearch', 'addFileToProgress',
      'removeFileSelection', 'setOverwriteDialogTitle', 'setOverwriteDialogMessage',
      'removeFileFromProgress']),
    ...mapActions(['showMessage']),

    formDateFromNow (date) {
      return moment(date).locale(this.$language.current).fromNow()
    },
    delayForScreenreader (func, delay = 500) {
      /*
      * Delay for screen readers Virtual buffers
      */
      setTimeout(() => func(), delay)
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
        if (n.name === name) {
          return n
        }
      })
    },
    processDirectoryEntryRecursively (directory) {
      return this.$client.files.createFolder(this.rootPath + directory.fullPath).then(() => {
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
    compareIds (a, b) {
      if (!isNaN(a)) { // OC10 autoincrement id
        return parseInt(a, 10) === parseInt(b, 10)
      } else if (this.isOcisId(b)) {
        return a === this.extractOpaqueId(b)
      }

      return false
    },
    isOcisId (id) {
      return atob(id).split(':').length === 2
    },
    extractOpaqueId (id) {
      return atob(id).split(':')[1]
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
      if (this.isIE11()) {
        this.showMessage({
          title: this.$gettext('Upload failed'),
          desc: this.$gettext('Upload of a folder is not supported in Internet Explorer.'),
          status: 'danger'
        })
        return
      }

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
          this.$_addFileToUploadProgress(file)
          directoryPath = file.webkitRelativePath.replace('/' + file.name, '')

          if (directoriesToCreate.indexOf(directoryPath) > -1) {
            continue
          }

          const directories = directoryPath.split('/')
          for (let i = 0; i < directories.length; i++) {
            if (i === 0) {
              if (directoriesToCreate.indexOf(directories[0]) === -1) {
                directoriesToCreate.push(directories[0])
              }

              continue
            }

            const parentDirectory = pathUtil.join.apply(null, directories.slice(0, i))
            const currentDirectory = `${parentDirectory}/${directories[i]}`

            if (directoriesToCreate.indexOf(currentDirectory) === -1) {
              directoriesToCreate.push(currentDirectory)
            }
          }
        }

        // Create folder structure
        const createFolderPromises = []
        const rootDir = directoriesToCreate[0]
        for (const directory of directoriesToCreate) {
          let p

          if (this.publicPage()) {
            p = this.directoryQueue.add(() => this.$client.publicFiles.createFolder(this.rootPath, directory, this.publicLinkPassword))
          } else {
            p = this.directoryQueue.add(() => this.$client.files.createFolder(this.rootPath + directory))
          }

          createFolderPromises.push(p)
        }
        // Upload files
        const uploadPromises = []
        Promise.all(createFolderPromises).then(() => {
          for (const file of files) {
            uploadPromises.push(this.$_ocUpload(file, file.webkitRelativePath, null, false, false))
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

    /**
     * Adds file into the progress queue and assigns it unique id
     * @param {Object} file File which is to be added into progress
     */
    $_addFileToUploadProgress (file) {
      file.id = this.uploadFileUniqueId
      this.uploadFileUniqueId++
      this.addFileToProgress(file)
    },

    $_ocUpload (file, path, overwrite = null, emitSuccess = true, addToProgress = true) {
      this.$root.$emit('upload-start')
      let basePath = this.path || ''
      let relativePath = path
      if (addToProgress) {
        this.$_addFileToUploadProgress(file)
      }

      let promise
      if (this.publicPage()) {
        // strip out public link token from path
        const tokenSplit = basePath.indexOf('/')
        const token = basePath.substr(0, tokenSplit)
        basePath = basePath.substr(tokenSplit + 1) || ''
        relativePath = pathUtil.join(basePath, relativePath)
        promise = this.uploadQueue.add(() => this.$client.publicFiles.putFileContents(token, relativePath, this.publicLinkPassword, file, {
          onProgress: (progress) => {
            this.$_ocUpload_onProgress(progress, file)
          },
          overwrite: overwrite
        }))
      } else {
        basePath = this.path || ''
        relativePath = pathUtil.join(basePath, relativePath)
        promise = this.uploadQueue.add(() => this.$client.files.putFileContents(relativePath, file, {
          onProgress: (progress) => {
            this.$_ocUpload_onProgress(progress, file)
          },
          overwrite: overwrite
        }))
      }

      promise.then(e => {
        this.$root.$emit('upload-end')
        this.removeFileFromProgress(file)
        if (emitSuccess) {
          this.$emit('success', e, file)
        }
      }).catch(e => {
        this.removeFileFromProgress(file)
        this.$emit('error', e)
      })
    },
    $_ocUpload_onProgress (e, file) {
      const progress = parseInt(e.loaded * 100 / e.total)
      this.$emit('progress', {
        id: file.id,
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
