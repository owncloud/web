const path = require('path')
const events = require('events')
const archiver = require('archiver')
const _ = require('lodash')

class UploadRemote extends events.EventEmitter {
  /**
   * UploadRemote is responsible for using webdriver protocol to upload a local
   * file to a remote Selenium server for use in testing uploads.
   *
   * @param {string} filePath Local path to the file used for uploading
   * @param {function (string): void} [callback] - called when file gets uploaded with path to uploaded file
   */
  command(filePath, callback) {
    const buffers = []
    const zip = archiver('zip')
    /*
    We add all the buffered data to  a list, and then,
    we concat all the buffer instances, base64encode it and send to the remote
    selenium browser. On completion, we get the result (containing the destination path to where the file
    was uploaded) which we can retrieve from the callback
     */
    zip
      .on('data', data => {
        buffers.push(data)
      })
      .on('error', err => {
        throw err
      })
      .on('warning', console.log)
      .on('finish', () => {
        const file = Buffer.concat(buffers).toString('base64')
        this.api.session(session => {
          const opt = {
            path: `/session/${session.sessionId}/file`,
            method: 'POST',
            data: { file }
          }
          this.client.transport
            .runProtocolAction(opt) // private api
            .then(result => {
              if (result.status !== 0) {
                throw new Error(result.value.message)
              }
              return result.value
            })
            .then(pathToFile => _.isFunction(callback) && callback(pathToFile))
            .then(() => this.emit('complete'))
        })
      })

    const name = path.basename(filePath)
    zip.file(filePath, { name })
    zip.finalize() // `finish` event fires after calling this
  }
}

module.exports = UploadRemote
