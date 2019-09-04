import { mapGetters, mapActions } from 'vuex'

export default {
  install (Vue) {
    Vue.mixin({
      computed: {
        ...mapGetters(['getToken', 'isAuthenticated']),
        ...mapGetters('Files', ['publicLinkPassword'])
      },
      methods: {
        ...mapActions('Files', ['addFileToProgress', 'updateFileProgress']),
        ...mapActions(['showMessage']),

        publicPage () {
          return !this.isAuthenticated
        },
        downloadFile (file) {
          this.addFileToProgress(file)
          let headers = null
          if (this.publicPage()) {
            const url = this.$client.publicFiles.getFileUrl(file.path)
            const password = this.publicLinkPassword
            if (password) {
              headers = { Authorization: 'Basic ' + Buffer.from('public:' + password).toString('base64') }
            }

            return this.downloadFileFromUrl(url, headers, file)
          }
          const url = this.$client.files.getFileUrl(file.path)
          headers = { Authorization: 'Bearer ' + this.getToken }

          return this.downloadFileFromUrl(url, headers, file)
        },
        downloadFileFromUrl (url, headers, file) {
          const request = new XMLHttpRequest()
          request.open('GET', url)
          request.responseType = 'blob'
          Object.keys(headers).forEach(p => request.setRequestHeader(p, headers[p]))

          request.addEventListener('readystatechange', () => {
            if (request.readyState === 2 && request.status !== 200) {
              this.showMessage({
                title: this.$gettext('Download failed'),
                desc: request.statusText,
                status: 'danger'
              })

              // Remove item from progress queue in case the request failed
              this.updateFileProgress({
                fileName: file.name,
                progress: 100
              })
            } else if (request.readyState === 4 && request.status === 200) {
              // Download has finished
              if (window.navigator && window.navigator.msSaveOrOpenBlob) { // for IE
                window.navigator.msSaveOrOpenBlob(request.response, file.name)
              } else { // for Non-IE (chrome, firefox etc.)
                const objectUrl = window.URL.createObjectURL(request.response)

                const anchor = document.createElement('a')
                anchor.href = objectUrl
                anchor.download = file.name
                anchor.style.display = 'none'
                document.body.appendChild(anchor)
                anchor.click()
                document.body.removeChild(anchor)
                window.URL.revokeObjectURL(objectUrl)

                // Items with small size can be fetched too fast for progress listener
                // This ensures that they'll be removed from progress queue
                this.updateFileProgress({
                  fileName: file.name,
                  progress: 100
                })
              }
            }
          })

          request.addEventListener('progress', e => {
            const progress = (e.loaded / e.total) * 100
            this.updateFileProgress({
              fileName: file.name,
              progress
            })
          })

          request.send()
        }

      }
    })
  }
}
