import PQueue from 'p-queue'

export default {
  install(Vue) {
    function _mediaSource(source, returnAs = 'url', headers = null) {
      return new Promise((resolve, reject) => {
        if (headers === null) {
          headers = new Headers()
          headers.append('Authorization', 'Bearer ' + Vue.$store.getters.getToken)
        }
        headers.append('X-Requested-With', 'XMLHttpRequest')

        fetch(source, { headers })
          .then((response) => {
            if (!response.ok) {
              reject(response)
              return
            }
            response.blob().then((blob) => {
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
          })
          .catch((e) => {
            console.warn('media-source', e)
            reject(e)
          })
      })
    }

    function _imageSourceHelper(el, binding) {
      // Set an empty image while resolving
      el.setAttribute(
        'src',
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
      )

      const value = binding.value
      el.setAttribute('data-image-source', value)
      _mediaSource(value)
        .then((dataImage) => {
          if (value !== el.getAttribute('data-image-source')) {
            console.warn('image-source was updated again before image could load')
            return
          }

          el.setAttribute('src', dataImage)
        })
        .catch((e) => {
          console.warn('image-source', e)
        })
    }

    // For use with <img> tags
    Vue.directive('image-source', {
      bind(el, binding) {
        _imageSourceHelper(el, binding)
      },
      update(el, binding) {
        if (binding.value === binding.oldValue) {
          return
        }
        _imageSourceHelper(el, binding)
      }
    })

    Vue.mixin({
      data: function () {
        return {
          mediaSourceQueue: new PQueue({ concurrency: 2 })
        }
      },
      methods: {
        mediaSource(source, returnAs = 'url', headers = null) {
          return this.mediaSourceQueue.add(() => _mediaSource(source, returnAs, headers))
        }
      }
    })
  }
}
