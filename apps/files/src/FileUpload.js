class FileUpload {
  constructor (file, url, headers = {}, onProgress = () => {}, type = 'POST') {
    this.file = file
    this.url = url
    this.headers = headers
    this.onProgress = onProgress
    this.type = type
  }

  upload (additionalData = {}) {
    let xhr = new XMLHttpRequest()
    xhr.responseType = 'text'

    // Headers
    xhr.open(this.type, this.url + encodeURIComponent(this.file.name), true)
    this._setXhrHeaders(xhr)

    // Events
    xhr.upload.addEventListener('progress', (e) => {
      this.onProgress(e, this.file)
    }, false)
    let promise = new Promise((resolve, reject) => {
      xhr.onload = e => {
        xhr.status >= 200 && xhr.status < 400 ? resolve(e) : reject(new Error(xhr.statusText))
      }
      xhr.onerror = e => {
        reject(e)
      }
    })

    // Start upload
    let formData = new FormData()
    formData.append('file', this.file)
    Object.keys(additionalData).forEach(p => {
      formData.append(p, additionalData[p])
    })
    xhr.send(formData)

    return promise
  }

  _setXhrHeaders (xhr) {
    Object.keys(this.headers).forEach(p =>
      xhr.setRequestHeader(p, this.headers[p])
    )
  }
}

export default FileUpload
