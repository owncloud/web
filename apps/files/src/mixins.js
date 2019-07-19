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
    ...mapGetters('Files', ['searchTerm', 'inProgress', 'files'])
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
        this.selectedFile = item
        this.newName = item.name
        item = this.newName
        return
      }
      if (this.selectedFile.name === item) {
        return
      }

      const translatedTitle = this.$gettext('Renaming of %{fileName} failed')

      if (item.includes('/')) {
        this.showMessage({
          title: this.$gettextInterpolate(translatedTitle, { fileName: this.selectedFile.name }, true),
          desc: this.$gettext('The file name cannot contain a "/"'),
          status: 'danger'
        })
        return
      }

      if (item === '.') {
        this.showMessage({
          title: this.$gettextInterpolate(translatedTitle, { fileName: this.selectedFile.name }, true),
          desc: this.$gettext('File name cannot be equal to "."'),
          status: 'danger'
        })
        return
      }

      if (item === '..') {
        this.showMessage({
          title: this.$gettextInterpolate(translatedTitle, { fileName: this.selectedFile.name }, true),
          desc: this.$gettext('File name cannot be equal to ".."'),
          status: 'danger'
        })
        return
      }

      if (/\s+$/.test(item)) {
        this.showMessage({
          title: this.$gettextInterpolate(translatedTitle, { fileName: this.selectedFile.name }, true),
          desc: this.$gettext('File name cannot end with whitespace'),
          status: 'danger'
        })
        return
      }

      const exists = this.files.find((n) => {
        if (n['name'] === item) {
          return n
        }
      })
      if (exists) {
        const translatedDesc = this.$gettext('File or folder with name "%{fileName}" already exists.')
        this.showMessage({
          title: this.$gettextInterpolate(translatedTitle, { fileName: this.selectedFile.name }, true),
          desc: this.$gettextInterpolate(translatedDesc, { fileName: item }, true),
          status: 'danger'
        })
        return
      }

      this.renameFile({
        client: this.$client,
        file: this.selectedFile,
        newValue: item
      })
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
    async $_ocUpload_addToQue (e) {
      const files = e.target.files || e.dataTransfer.files
      if (!files.length) return
      for (const file of files) {
        const exists = this.files.find((n) => {
          if (n['name'] === file.name) {
            return n
          }
        })

        if (!exists) {
          this.$_ocUpload(file)
          continue
        }

        const translated = this.$gettext('File %{file} already exists.')
        this.setOverwriteDialogTitle(this.$gettextInterpolate(translated, { file: file.name }, true))
        this.setOverwriteDialogMessage(this.$gettext('Do you want to overwrite it?'))
        const overwrite = await this.$_ocUpload_confirmOverwrite()
        if (overwrite) this.$_ocUpload(file, exists.etag)
        this.setOverwriteDialogMessage(null)
      }
    },
    $_ocUpload_confirmOverwrite (overwrite) {
      return new Promise(resolve => {
        const confirmButton = document.querySelector('#overwrite-ok')
        confirmButton.addEventListener('click', (e) => {
          resolve(e)
        })
      })
    },
    $_ocUpload (file, overwrite = null) {
      this.addFileToProgress(file)
      const fileUpload = new FileUpload(file, this.url, this.headers, this.$_ocUpload_onProgress, this.requestType)
      fileUpload
        .upload({
          overwrite: overwrite
        })
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
