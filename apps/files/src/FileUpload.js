class FileUpload {
  constructor (file, path, url, headers = {}, onProgress = () => {}, type = 'POST') {
    this.file = file
    this.path = path
    this.url = url
    this.headers = headers
    this.onProgress = onProgress
    this.type = type
  }

  upload (options = {}) {
    const xhr = new XMLHttpRequest()

    // Headers
    this.path = this.path.replace(/(^\/+)/, '')
    let paths = this.path.split('/')
    paths = paths.map(path => encodeURIComponent(path))
    this.path = paths.join('/')
    xhr.open(this.type, this.url + this.path, true)
    xhr.responseType = 'text'
    if (options.overwrite) {
      this.headers['If-Match'] = options.overwrite
      delete this.headers['If-None-Match']
    } else {
      this.headers['If-None-Match'] = '*'
      delete this.headers['If-Match']
    }
    this._setXhrHeaders(xhr)

    // Events
    xhr.upload.addEventListener('progress', (e) => {
      this.onProgress(e, this.file)
    }, false)
    const promise = new Promise((resolve, reject) => {
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
