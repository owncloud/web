import { mapGetters, mapActions } from 'vuex'

export default {
  install (Vue) {
    Vue.mixin({
      computed: {
        ...mapGetters(['getToken', 'isAuthenticated']),
        ...mapGetters('Files', ['publicLinkPassword'])
      },
      methods: {
        ...mapActions('Files', ['addActionToProgress', 'removeActionFromProgress']),
        ...mapActions(['showMessage']),

        publicPage () {
          // public page is either when not authenticated
          // but also when accessing pages that require no auth even when authenticated
          return !this.isAuthenticated || this.$route.meta.auth === false
        },
        downloadFile (file) {
          this.addActionToProgress(file)
          let headers = {}
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
              this.removeActionFromProgress(file)
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
                this.removeActionFromProgress(file)

                // TODO: Bring back when progress bar for download is figured out
                // Items with small size can be fetched too fast for progress listener
                // This ensures that they'll be removed from progress queue
                // this.updateFileProgress({
                //   fileName: file.name,
                //   progress: 100
                // })
              }
            }
          })

          // TODO: Bring back when progress bar for download is figured out
          // request.addEventListener('progress', e => {
          //   const progress = (e.loaded / e.total) * 100
          //   this.updateFileProgress({
          //     fileName: file.name,
          //     progress
          //   })
          // })

          request.send()
        },

        /**
         * Checks whether the browser is Internet Explorer 11
         * @return {boolean} true if the browser is Internet Expoler 11
         */
        isIE11 () {
          return !!window.MSInputMethodContext && !!document.documentMode
        }
      }
    })
  }
}
