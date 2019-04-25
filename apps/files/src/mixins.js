import filesize from 'filesize'
import moment from 'moment'
import FileUpload from './FileUpload.js'
import fileTypeIconMappings from './fileTypeIconMappings.json'
import { mapActions, mapGetters } from 'vuex'
import { find } from 'lodash'

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
    ...mapGetters('Files', ['searchTerm', 'inProgress', 'files'])
  },
  methods: {
    ...mapActions('Files', ['resetSearch', 'addFileToProgress']),
    ...mapActions(['showNotification']),

    formDateFromNow (date) {
      return moment(date).locale(this.$language.current).fromNow()
    },
    navigateTo (route, param) {
      if (this.searchTerm !== '' && this.$route.params.item === param) {
        this.resetSearch()
      }
      this.$router.push({
        'name': route,
        'params': {
          'item': param
        }
      })
    },
    reallyDeleteFile () {
      this.deleteFiles({
        client: this.$client,
        files: [this.fileToBeDeleted]
      })
      this.deleteConfirmation = ''
      this.fileToBeDeleted = null
    },
    changeName (item) {
      this.changeFileName = !this.changeFileName
      if (typeof item === 'object') {
        this.selectedFile = item
        this.newName = item.name
      } else {
        if (item.includes('/')) {
          this.showNotification({
            title: this.$gettext(`Renaming of ${this.selectedFile.name} failed. The file name cannot contain a "/"`),
            status: 'danger'
          })
          return
        }
        this.renameFile({
          client: this.$client,
          file: this.selectedFile,
          newValue: item
        })
      }
    },
    downloadFile (file) {
      const url = this.$client.files.getFileUrl(file.path)
      let anchor = document.createElement('a')

      let headers = new Headers()
      headers.append('Authorization', 'Bearer ' + this.getToken)

      fetch(url, { headers })
        .then(response => response.blob())
        .then(blobby => {
          let objectUrl = window.URL.createObjectURL(blobby)

          anchor.href = objectUrl
          anchor.download = file.name
          anchor.click()

          window.URL.revokeObjectURL(objectUrl)
        })
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
      let cssClass = ['uk-label']

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
    $_ocUpload_addToQue (e) {
      let files = e.target.files || e.dataTransfer.files
      if (!files.length) return
      for (let file of files) {
        let exists = find(this.files, ['name', file.name])
        if (!exists) {
          this.$_ocUpload(file)
        } else {
          this.showNotification({
            title: this.$gettextInterpolate('Upload for %{file} failed - File already exists', { file: file.name }),
            type: 'error'
          })
        }
      }
    },
    $_ocUpload (file) {
      this.addFileToProgress(file)
      let fileUpload = new FileUpload(file, this.url, this.headers, this.$_ocUpload_onProgress, this.requestType)
      fileUpload
        .upload(this.additionalData)
        .then(e => {
          this.$emit('success', e, file)
          this.$_ocUploadInput_clean()
        })
        .catch(e => {
          this.$emit('error', e)
          this.$_ocUploadInput_clean()
        })
    },
    $_ocUpload_onProgress (e, file) {
      let progress = parseInt(e.loaded * 100 / e.total)
      this.$emit('progress', {
        fileName: file.name,
        progress
      })
    },
    $_ocUploadInput_clean () {
      let input = this.$refs.input
      if (input) {
        input.value = ''
      }
    }
  }
}
