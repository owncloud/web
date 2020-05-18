import tus from 'tus-js-client'

export default {
  install(Vue) {
    Vue.mixin({
      computed: {
        browserSupportsChunked() {
          return tus.isSupported
        }
      },
      methods: {
        uploadChunkedFile(file, path, options) {
          return new Promise((resolve, reject) => {
            const headers = this.$client.helpers.buildHeaders()
            delete headers['OCS-APIREQUEST']
            var mtime = null
            if (file.lastModifiedDate) {
              mtime = file.lastModifiedDate.getTime() / 1000
            }
            if (file.lastModified) {
              mtime = file.lastModified / 1000
            }
            const upload = new tus.Upload(file, {
              endpoint: this.$client.files.getFileUrlV2(path),
              headers: headers,
              chunkSize: options.chunkSize || Infinity,
              removeFingerprintOnSuccess: true,
              retryDelays: [0, 3000, 5000, 10000, 20000],
              metadata: {
                filename: file.name,
                filetype: file.type,
                size: file.size,
                mtime: mtime
              },

              onError: error => {
                console.error(`Error uploading file "${file}" to "${path}"`, error)
                // TODO: parse actual error message from body instead of using the default TUS one
                // and set it on "error.message"
                // should we generate error messages from the client for known status codes ?
                reject(error)
              },

              onProgress: (bytesUploaded, bytesTotal) => {
                options.emitProgress({ loaded: bytesUploaded, total: bytesTotal })
              },

              onSuccess: () => {
                resolve(`File ${upload.file.name} was successfully uploaded`)
              },

              onShouldRetry: err => {
                const status = err.originalResponse ? err.originalResponse.getStatus() : 0
                // don't retry on: "forbidden", "conflict", "precondition failed" and "locked"
                if (status === 403 || status === 409 || status === 412 || status === 423) {
                  return false
                }
                return true
              }
            })

            upload.start()
            return upload
          })
        }
      }
    })
  }
}
