
export default {
  install (Vue) {
    Vue.mixin({
      methods: {
        publicPage () {
          return this.$route.meta.auth === false
        },
        downloadFile (file) {
          if (this.publicPage()) {
            const url = this.$client.publicFiles.getFileUrl(file.path)
            const headers = new Headers()
            const password = this.publicLinkPassword
            if (password) {
              headers.append('Authorization', 'Basic ' + Buffer.from('public:' + password).toString('base64'))
            }

            return this.downloadFileFromUrl(url, headers, file.name)
          }
          const url = this.$client.files.getFileUrl(file.path)
          const headers = new Headers()
          headers.append('Authorization', 'Bearer ' + this.getToken)

          return this.downloadFileFromUrl(url, headers, file.name)
        },
        downloadFileFromUrl (url, headers, fileName) {
          return fetch(url, { headers })
            .then(response => {
              if (response.ok) {
                return response.blob()
                  .then(blob => {
                    if (window.navigator && window.navigator.msSaveOrOpenBlob) { // for IE
                      window.navigator.msSaveOrOpenBlob(blob, fileName)
                    } else { // for Non-IE (chrome, firefox etc.)
                      const objectUrl = window.URL.createObjectURL(blob)

                      const anchor = document.createElement('a')
                      anchor.href = objectUrl
                      anchor.download = fileName
                      anchor.click()

                      window.URL.revokeObjectURL(objectUrl)
                    }
                  })
              }
              return Promise.reject(new Error(response.statusText))
            })
            .catch(error => console.log(error))
        }

      }
    })
  }
}
