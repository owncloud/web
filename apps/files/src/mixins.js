import filesize from 'filesize'
import moment from 'moment'
import fileTypeIconMappings from './fileTypeIconMappings.json'

export default {
  filters: {
    fileSize (int) {
      if (int < 0) {
        return ''
      }
      if (isNaN(int)) {
        return '?'
      }
      return filesize(int * 100, {
        round: 2
      })
    }
  },
  data: () => ({
    selectedFile: ''
  }),
  methods: {
    formDateFromNow (date) {
      return moment(date).locale(this.$language.current).fromNow()
    },
    navigateTo (route, param) {
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
    }
  }
}
