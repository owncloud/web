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
            let mtime = null
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
              overridePatchMethod: !!options.overridePatchMethod,
              retryDelays: [0, 3000, 5000, 10000, 20000],
              metadata: {
                filename: file.name,
                filetype: file.type,
                size: file.size,
                mtime: mtime
              },

              onError: (error) => {
                console.error(`Error uploading file "${file}" to "${path}"`, error)
                reject(error)
              },

              onProgress: (bytesUploaded, bytesTotal) => {
                options.emitProgress({ loaded: bytesUploaded, total: bytesTotal })
              },

              onSuccess: () => {
                resolve(`File ${upload.file.name} was successfully uploaded`)
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
