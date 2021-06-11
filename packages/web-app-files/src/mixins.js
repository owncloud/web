import pathUtil from 'path'
import moment from 'moment'
import fileTypeIconMappings from './fileTypeIconMappings.json'
import { mapActions, mapGetters } from 'vuex'
import PQueue from 'p-queue'

export default {
  filters: {
    roundNumber(int) {
      return parseInt(int.toFixed(0))
    }
  },
  data: () => ({
    uploadQueue: new PQueue({ concurrency: 1 }),
    directoryQueue: new PQueue({ concurrency: 1 }),
    uploadFileUniqueId: 0,
    /**
     * Resources in the upload queue which already exists
     */
    existingResources: []
  }),
  computed: {
    ...mapGetters('Files', [
      'searchTerm',
      'files',
      'highlightedFile',
      'publicLinkPassword',
      'fileSortField',
      'currentFolder',
      'fileSortDirectionDesc'
    ]),
    ...mapGetters(['getToken', 'capabilities', 'configuration']),

    _sidebarOpen() {
      return this.highlightedFile !== null
    },

    requestHeaders() {
      if (!this.publicPage()) {
        return null
      }

      const headers = new Headers()
      headers.append('X-Requested-With', 'XMLHttpRequest')

      const password = this.publicLinkPassword
      if (password) {
        headers.append(
          'Authorization',
          'Basic ' + Buffer.from('public:' + password).toString('base64')
        )
      }
      return headers
    }
  },
  methods: {
    ...mapActions('Files', [
      'resetSearch',
      'addFileToProgress',
      'removeFileSelection',
      'removeFileFromProgress',
      'setFilesSort'
    ]),
    ...mapActions(['showMessage', 'createModal', 'hideModal']),

    toggleSort(fieldId) {
      if (this.fileSortField === fieldId) {
        // reverse direction
        this.setFilesSort({ field: fieldId, directionIsDesc: !this.fileSortDirectionDesc })
      } else {
        // switch to the other column
        this.setFilesSort({ field: fieldId, directionIsDesc: false })
      }
    },
    formDateFromNow(date) {
      return moment(date)
        .locale(this.$language.current)
        .fromNow()
    },
    delayForScreenreader(func, delay = 500) {
      /*
       * Delay for screen readers Virtual buffers
       */
      setTimeout(() => func(), delay)
    },
    fileTypeIcon(file) {
      if (file) {
        if (file.type === 'folder') {
          return 'folder'
        }
        if (typeof file.extension === 'string') {
          const icon = fileTypeIconMappings[file.extension.toLowerCase()]
          if (icon) {
            return `${icon}`
          }
        }
      }
      return 'file'
    },
    label(string) {
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
    checkIfBrowserSupportsFolderUpload() {
      const el = document.createElement('input')
      el.type = 'file'
      return (
        typeof el.webkitdirectory !== 'undefined' ||
        typeof el.mozdirectory !== 'undefined' ||
        typeof el.directory !== 'undefined'
      )
    },
    checkIfElementExists(element) {
      const name = element.name || element
      return this.files.find(n => {
        if (n.name === name) {
          return n
        }
      })
    },
    processDirectoryEntryRecursively(directory) {
      return this.$client.files.createFolder(this.rootPath + directory.fullPath).then(() => {
        const directoryReader = directory.createReader()
        const ctrl = this
        directoryReader.readEntries(function(entries) {
          entries.forEach(function(entry) {
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
    compareIds(a, b) {
      if (!isNaN(a)) {
        // OC10 autoincrement id
        return parseInt(a, 10) === parseInt(b, 10)
      } else if (this.isOcisId(b)) {
        return a === this.extractOpaqueId(b)
      }

      return false
    },
    isOcisId(id) {
      return atob(id).split(':').length === 2
    },
    extractOpaqueId(id) {
      return atob(id).split(':')[1]
    },

    hideOverwriteDialog() {
      this.existingResources = []
      this.hideModal()
    },

    confirmOverwrite() {
      for (const resource of this.existingResources) {
        this.$_ocUpload(resource.file, resource.path, resource.etag)
      }

      this.hideOverwriteDialog()
    },

    displayOverwriteDialog() {
      const translated = this.$gettext('File %{file} already exists')
      const isVersioningEnabled =
        !this.publicPage() && this.capabilities.files && this.capabilities.files.versioning
      // TODO: Handle properly case of multiple existing files
      const title =
        this.existingResources.length > 1
          ? this.$gettext('Multiple files already exists')
          : this.$gettextInterpolate(
              translated,
              { file: this.existingResources[0].file.name },
              true
            )

      const modal = {
        variation: isVersioningEnabled ? 'passive' : 'danger',
        icon: 'cloud_upload',
        title,
        message: isVersioningEnabled
          ? this.$gettext('Do you want to create a new version?')
          : this.$gettext('Do you want to overwrite it?'),
        cancelText: this.$gettext('Cancel'),
        confirmText: isVersioningEnabled ? this.$gettext('Create') : this.$gettext('Overwrite'),
        onCancel: this.hideOverwriteDialog,
        onConfirm: this.confirmOverwrite
      }

      this.createModal(modal)
    },

    $_ocUpload_addDropToQue(e) {
      const items = e.dataTransfer.items || e.dataTransfer.files
      const promises = []

      // A list of files is being dropped ...
      if (items instanceof FileList) {
        this.$_ocUpload_addDirectoryToQue(e)
        return
      }

      for (let item of items) {
        item = item.webkitGetAsEntry()
        const exists = this.checkIfElementExists(item)

        if (item.isDirectory) {
          if (exists) {
            this.showMessage({
              title: this.$gettextInterpolate(
                this.$gettext('Folder %{folder} already exists.'),
                { folder: item.name },
                true
              ),
              status: 'danger',
              autoClose: {
                enabled: true
              }
            })

            continue
          }

          this.processDirectoryEntryRecursively(item).then(() => {
            this.$emit('success', null, item.name)
          })

          continue
        }

        if (exists) {
          promises.push(
            new Promise(resolve => {
              item.file(file => {
                this.existingResources.push({ file, path: item.fullPath, etag: exists.etag })

                resolve()
              })
            })
          )

          continue
        }

        item.file(file => {
          this.$_ocUpload(file, item.fullPath)
        })
      }

      // Ensures with promises that all files will be properly pushed into the existingResources array
      if (promises.length > 0) {
        Promise.all(promises).then(() => {
          this.displayOverwriteDialog()
        })
      }
    },

    $_ocUpload_addFileToQue(e) {
      const files = e.target.files

      if (files.length < 1) {
        return
      }

      for (let i = 0; i < files.length; i++) {
        const exists = this.checkIfElementExists(files[i])

        if (exists) {
          this.existingResources.push({ file: files[i], path: files[i].name, etag: exists.etag })

          continue
        }

        this.$_ocUpload(files[i], files[i].name)
      }

      this.$_ocUploadInput_clean()

      if (this.existingResources.length > 0) {
        this.displayOverwriteDialog()
      }
    },

    $_ocUpload_addDirectoryToQue(e) {
      if (this.isIE11()) {
        this.showMessage({
          title: this.$gettext('Upload failed'),
          desc: this.$gettext('Upload of a folder is not supported in Internet Explorer.'),
          status: 'danger',
          autoClose: {
            enabled: true
          }
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
          title: this.$gettextInterpolate(
            this.$gettext('Folder %{folder} already exists.'),
            { folder: directoryName },
            true
          ),
          status: 'danger',
          autoClose: {
            enabled: true
          }
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
            p = this.directoryQueue.add(() =>
              this.$client.publicFiles.createFolder(
                this.rootPath,
                directory,
                this.publicLinkPassword
              )
            )
          } else {
            p = this.directoryQueue.add(() =>
              this.$client.files.createFolder(this.rootPath + directory)
            )
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

    /**
     * Adds file into the progress queue and assigns it unique id
     * @param {Object} file File which is to be added into progress
     */
    $_addFileToUploadProgress(file) {
      file.id = this.uploadFileUniqueId
      this.uploadFileUniqueId++
      this.addFileToProgress(file)
    },

    $_ocUpload(file, path, overwrite = null, emitSuccess = true, addToProgress = true) {
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
        const extraHeaders = {}
        if (file.lastModifiedDate) {
          extraHeaders['X-OC-Mtime'] = '' + file.lastModifiedDate.getTime() / 1000
        } else if (file.lastModified) {
          extraHeaders['X-OC-Mtime'] = '' + file.lastModified / 1000
        }
        promise = this.uploadQueue.add(() =>
          this.$client.publicFiles.putFileContents(
            token,
            relativePath,
            this.publicLinkPassword,
            file,
            {
              headers: extraHeaders,
              onProgress: progress => {
                this.$_ocUpload_onProgress(progress, file)
              },
              overwrite: overwrite
            }
          )
        )
      } else {
        basePath = this.path || ''
        relativePath = pathUtil.join(basePath, relativePath)
        // FIXME: this might break if relativePath is not the currentFolder
        // and is a mount point that has no chunk support
        if (this.browserSupportsChunked && this.currentFolder.isChunkedUploadSupported) {
          let chunkSize = this.configuration.uploadChunkSize
          if (this.capabilities.files.tus_support.max_chunk_size > 0) {
            if (
              chunkSize === null ||
              chunkSize === 0 ||
              chunkSize > this.capabilities.files.tus_support.max_chunk_size
            ) {
              chunkSize = this.capabilities.files.tus_support.max_chunk_size
            }
          }
          promise = this.uploadQueue.add(() => {
            return this.uploadChunkedFile(file, pathUtil.dirname(relativePath), {
              chunkSize: chunkSize,
              overridePatchMethod: !!this.capabilities.files.tus_support.http_method_override,
              emitProgress: progress => {
                this.$_ocUpload_onProgress(progress, file)
              }
            })
          })
        } else {
          const extraHeaders = {}
          if (file.lastModifiedDate) {
            extraHeaders['X-OC-Mtime'] = '' + file.lastModifiedDate.getTime() / 1000
          } else if (file.lastModified) {
            extraHeaders['X-OC-Mtime'] = '' + file.lastModified / 1000
          }
          promise = this.uploadQueue.add(() =>
            this.$client.files.putFileContents(relativePath, file, {
              headers: extraHeaders,
              onProgress: progress => {
                this.$_ocUpload_onProgress(progress, file)
              },
              overwrite: overwrite
            })
          )
        }
      }

      promise
        .then(e => {
          this.$root.$emit('upload-end')
          this.removeFileFromProgress(file)
          if (emitSuccess) {
            this.$emit('success', e, file)
          }
        })
        .catch(e => {
          this.removeFileFromProgress(file)
          this.$emit('error', e)
        })
    },
    $_ocUpload_onProgress(e, file) {
      const progress = parseInt((e.loaded * 100) / e.total)
      this.$emit('progress', {
        id: file.id,
        fileName: file.name,
        progress
      })
    },
    $_ocUploadInput_clean() {
      const input = this.$refs.input
      if (input) {
        input.value = ''
      }
    }
  }
}
