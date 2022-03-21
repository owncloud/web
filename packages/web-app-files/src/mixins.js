import pathUtil from 'path'
import { DateTime } from 'luxon'
import { mapActions, mapGetters } from 'vuex'
import PQueue from 'p-queue'
import { buildWebDavFilesPath, buildWebDavSpacesPath } from './helpers/resources'

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
    ...mapGetters('Files', ['files', 'highlightedFile', 'publicLinkPassword', 'currentFolder']),
    ...mapGetters(['getToken', 'capabilities', 'configuration']),
    ...mapGetters(['user'])
  },
  methods: {
    ...mapActions('Files', ['resetSearch', 'addFileToProgress', 'removeFileFromProgress']),
    ...mapActions(['showMessage', 'createModal', 'hideModal']),

    formDateFromJSDate(date, format = DateTime.DATETIME_FULL) {
      return DateTime.fromJSDate(date).setLocale(this.$language.current).toLocaleString(format)
    },
    formDateFromHTTP(date, format = DateTime.DATETIME_FULL) {
      return DateTime.fromHTTP(date).setLocale(this.$language.current).toLocaleString(format)
    },
    formDateFromISO(date, format = DateTime.DATETIME_FULL) {
      return DateTime.fromISO(date).setLocale(this.$language.current).toLocaleString(format)
    },
    formDateFromRFC(date, format = DateTime.DATETIME_FULL) {
      return DateTime.fromRFC2822(date).setLocale(this.$language.current).toLocaleString(format)
    },
    formRelativeDateFromJSDate(date) {
      return DateTime.fromJSDate(date).setLocale(this.$language.current).toRelative()
    },
    formRelativeDateFromHTTP(date) {
      return DateTime.fromHTTP(date).setLocale(this.$language.current).toRelative()
    },
    formRelativeDateFromISO(date) {
      return DateTime.fromISO(date).setLocale(this.$language.current).toRelative()
    },
    formRelativeDateFromRFC(date) {
      return DateTime.fromRFC2822(date).setLocale(this.$language.current).toRelative()
    },
    delayForScreenreader(func, delay = 500) {
      /*
       * Delay for screen readers Virtual buffers
       */
      setTimeout(() => func(), delay)
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
      return this.files.find((file) => file.name === name)
    },

    async processDirectoryEntryRecursively(directory) {
      // step 1: create folder
      await this.$_buildCreateFolderCallback(this.rootPath, directory.fullPath, {
        userId: this.user?.id,
        storageId: this.$route.params.storageId,
        publicLinkPassword: this.publicLinkPassword
      })()

      // step 2: for all files in folder: recursion (if folder) or upload (if file)
      const directoryReader = directory.createReader()
      const ctrl = this
      directoryReader.readEntries(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isDirectory) {
            ;(() => {
              ctrl.processDirectoryEntryRecursively(entry)
            })()
          } else {
            entry.file((file) => {
              ctrl.$_ocUpload(file, entry.fullPath, null, false)
            })
          }
        })
      })
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
      const translated = this.$gettext('File "%{file}" already exists')
      const isVersioningEnabled =
        !this.publicPage() && this.capabilities.files && this.capabilities.files.versioning
      // TODO: Handle properly case of multiple existing files
      const title =
        this.existingResources.length > 1
          ? this.$gettext('Multiple files already exist')
          : this.$gettextInterpolate(
              translated,
              { file: this.existingResources[0].file.name },
              true
            )

      const modal = {
        variation: isVersioningEnabled ? 'passive' : 'danger',
        icon: 'upload-cloud',
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

    $_ocUpload_addDropToQueue(e) {
      const items = e.dataTransfer.items || e.dataTransfer.files
      const promises = []

      // A list of files is being dropped ...
      if (items instanceof FileList) {
        this.$_ocUpload_addDirectoryToQueue(e)
        return
      }

      for (let item of items) {
        item = item.webkitGetAsEntry()
        const exists = this.checkIfElementExists(item)

        if (item.isDirectory) {
          if (exists) {
            this.showMessage({
              title: this.$gettextInterpolate(
                this.$gettext('Folder "%{folder}" already exists.'),
                { folder: item.name },
                true
              ),
              status: 'danger'
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
            new Promise((resolve) => {
              item.file((file) => {
                this.existingResources.push({ file, path: item.fullPath, etag: exists.etag })

                resolve()
              })
            })
          )

          continue
        }

        item.file((file) => {
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

    $_ocUpload_addFileToQueue(e) {
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

    $_ocUpload_addDirectoryToQueue(e) {
      const files = e.target.files || e.dataTransfer.files
      if (!files.length) return

      // Check if base directory exists
      let directoryPath = files[0].webkitRelativePath.replace('/' + files[0].name, '')
      const directoryName = directoryPath.split('/')[0]
      const directoryExists = this.checkIfElementExists(directoryName)

      if (directoryExists) {
        this.showMessage({
          title: this.$gettextInterpolate(
            this.$gettext('Folder "%{folder}" already exists.'),
            { folder: directoryName },
            true
          ),
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
          createFolderPromises.push(
            this.directoryQueue.add(
              this.$_buildCreateFolderCallback(this.rootPath, directory, {
                userId: this.user?.id,
                storageId: this.$route.params.storageId,
                publicLinkPassword: this.publicLinkPassword
              })
            )
          )
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

    $_buildCreateFolderCallback(rootPath, directory, { userId, storageId, publicLinkPassword }) {
      if (this.publicPage()) {
        return () => this.$client.publicFiles.createFolder(rootPath, directory, publicLinkPassword)
      }

      const path = storageId
        ? buildWebDavSpacesPath(storageId, `${rootPath}${directory}`)
        : buildWebDavFilesPath(userId, `${rootPath}${directory}`)
      return () => this.$client.files.createFolder(path)
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
        const token = basePath.substring(0, tokenSplit)
        basePath = basePath.substring(tokenSplit + 1) || ''
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
              onProgress: (progress) => {
                this.$_ocUpload_onProgress(progress, file)
              },
              overwrite: overwrite
            }
          )
        )
      } else {
        basePath = this.path || ''
        const joinedPath = pathUtil.join(basePath, relativePath)

        if (this.$route.params.storageId) {
          relativePath = buildWebDavSpacesPath(this.$route.params.storageId, joinedPath)
        } else {
          relativePath = buildWebDavFilesPath(this.user.id, joinedPath)
        }
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
              emitProgress: (progress) => {
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
              onProgress: (progress) => {
                this.$_ocUpload_onProgress(progress, file)
              },
              overwrite: overwrite
            })
          )
        }
      }

      promise
        .then((e) => {
          this.$root.$emit('upload-end')
          this.removeFileFromProgress(file)
          if (emitSuccess) {
            this.$emit('success', e, file)
          }
        })
        .catch((e) => {
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
