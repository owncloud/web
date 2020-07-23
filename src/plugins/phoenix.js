import { mapGetters, mapActions } from 'vuex'

export default {
  install(Vue) {
    Vue.mixin({
      computed: {
        ...mapGetters(['getToken', 'isAuthenticated', 'capabilities']),
        ...mapGetters('Files', ['publicLinkPassword']),

        currentExtension() {
          return this.$route.path.split('/')[1]
        },

        isDownloadUrlSigningEnabled() {
          return this.capabilities.core && this.capabilities.core['support-url-signing']
        }
      },
      methods: {
        ...mapActions('Files', ['addActionToProgress', 'removeActionFromProgress']),
        ...mapActions(['showMessage']),

        publicPage() {
          // public page is either when not authenticated
          // but also when accessing pages that require no auth even when authenticated
          return !this.isAuthenticated || this.$route.meta.auth === false
        },
        // FIXME: optional publicContext parameter is a mess
        async downloadFile(file, publicContext = null) {
          const publicPage = publicContext !== null ? publicContext : this.publicPage()

          // construct the url and headers
          let url = null
          let headers = {}
          if (publicPage) {
            url = this.$client.publicFiles.getFileUrl(file.path)
            const password = this.publicLinkPassword
            if (password) {
              headers = {
                Authorization: 'Basic ' + Buffer.from('public:' + password).toString('base64')
              }
            }
          } else {
            url = this.$client.helpers._webdavUrl + file.path
            headers = { Authorization: 'Bearer ' + this.getToken }
          }

          // download with signing enabled
          if (this.isDownloadUrlSigningEnabled) {
            try {
              const response = await fetch(url, {
                method: 'HEAD',
                headers
              })
              if (response.status === 200) {
                const signedUrl = await this.$client.signUrl(url)
                // create anchor dom element
                const a = document.createElement('a')
                a.style.display = 'none'
                document.body.appendChild(a)
                a.href = signedUrl
                // use download attribute to set desired file name
                a.setAttribute('download', file.name)
                // trigger the download by simulating click
                a.click()
                // cleanup
                document.body.removeChild(a)
                return
              }
            } catch (ignored) {}
            this.showMessage({
              title: this.$gettext('Download failed'),
              desc: this.$gettext('File could not be located'),
              status: 'danger'
            })
            return
          }

          // download without url signing enabled
          this.addActionToProgress(file)
          if (publicPage) {
            return this.downloadFileFromUrlAsBlob(url, headers, file)
          }
          return this.downloadFileFromUrlAsBlob(url, headers, file)
        },
        downloadFileFromUrlAsBlob(url, headers, file) {
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
              if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                // for IE
                window.navigator.msSaveOrOpenBlob(request.response, file.name)
              } else {
                // for Non-IE (chrome, firefox etc.)
                const objectUrl = window.URL.createObjectURL(request.response)

                const anchor = document.createElement('a')
                anchor.href = objectUrl
                anchor.download = file.name
                anchor.style.display = 'none'
                document.body.appendChild(anchor)
                anchor.click()
                document.body.removeChild(anchor)
                window.URL.revokeObjectURL(objectUrl)

                // TODO: Bring back when progress bar for download is figured out
                // Items with small size can be fetched too fast for progress listener
                // This ensures that they'll be removed from progress queue
                // this.updateFileProgress({
                //   fileName: file.name,
                //   progress: 100
                // })
              }

              this.removeActionFromProgress(file)
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
        isIE11() {
          return !!window.MSInputMethodContext && !!document.documentMode
        },
        /**
         * URI-Encodes a file path but keep the path slashes.
         *
         * @param path path
         * @return encoded path
         */
        encodePath: function(path) {
          if (!path) {
            return path
          }
          var parts = path.split('/').map(part => encodeURIComponent(part))
          return parts.join('/')
        }
      }
    })
  }
}
