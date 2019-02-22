import Vue from 'vue'
import store from '../store'

export const EventBus = new Vue()

function fetchDownload (file) {
  const url = this.$client.files.getFileUrl(file.path)
  let anchor = document.createElement('a')
  let headers = new Headers()
  headers.append('Authorization', 'Bearer ' + store.state.user.token)

  fetch(url, { headers })
    .then(response => response.blob())
    .then(blobby => {
      let objectUrl = window.URL.createObjectURL(blobby)
      EventBus.$emit(`${file.id}-download`)

      anchor.href = objectUrl
      anchor.download = file.name
      anchor.click()

      window.URL.revokeObjectURL(objectUrl)
    })
    .then(EventBus.$emit(`${file.id}-download`))
}

// function streamDownload (file) {
//
// }

EventBus.$on('download-file', fetchDownload)
