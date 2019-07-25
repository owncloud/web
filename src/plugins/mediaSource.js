import store from '../store'

export default {
  install (Vue) {
    // For use with <img> tags
    Vue.directive('image-source', {
      bind (el, binding) {
        // Set an empty image while resolving
        el.setAttribute('src', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=')

        this.mediaSource(binding.value).then(dataImage => {
          el.setAttribute('src', dataImage)
        }).catch(e => {
          console.warn('image-source', e)
        })
      }
    })

    Vue.mixin({
      methods: {
        mediaSource (source, returnAs = 'url') {
          return new Promise((resolve, reject) => {
            const headers = new Headers()
            headers.append('Authorization', 'Bearer ' + store.getters.getToken)

            fetch(source, { headers }).then(response => {
              response.blob().then(blob => {
                if (returnAs === 'base64') {
                  const reader = new FileReader()
                  reader.readAsDataURL(blob)
                  reader.onloadend = function () {
                    resolve(reader)
                  }
                } else if (returnAs === 'url') {
                  const source = window.URL.createObjectURL(blob)
                  resolve(source)
                }
              })
            }).catch(e => {
              console.warn('media-source', e)
              reject(e)
            })
          })
        }
      }
    })
  }
}
