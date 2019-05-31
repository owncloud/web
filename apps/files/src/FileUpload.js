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

    // Headers
    xhr.open(this.type, this.url + encodeURIComponent(this.file.name), true)
    xhr.responseType = 'text'
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
    xhr.send(this.file)

    return promise
  }

  _setXhrHeaders (xhr) {
    Object.keys(this.headers).forEach(p =>
      xhr.setRequestHeader(p, this.headers[p])
    )
  }
}

export default FileUpload
