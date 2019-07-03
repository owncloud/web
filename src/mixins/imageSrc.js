import store from '../store'

export default {
  /**
   * Usage <img v-image-src="https://.../path/image.jpg" />
   */

  bind (el, binding) {
    // Set an empty image while resolving
    el.setAttribute('src', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=')

    let headers = new Headers()
    headers.append('Authorization', 'Bearer ' + store.getters.getToken)

    fetch(binding.value, { headers }).then(response => {
      response.blob().then(e => {
        let reader = new FileReader()
        reader.readAsDataURL(e)
        reader.onloadend = function () {
          el.setAttribute('src', reader.result)
        }
      })
    }).catch(e => {
      console.warn('image-src', e)
    })
  }
}
