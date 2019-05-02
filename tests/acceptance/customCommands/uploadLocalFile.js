const path = require('path')
const util = require('util')
const events = require('events')
const archiver = require('archiver')

const handleResult = cb => result => {
  if (result.status !== 0) throw new Error(result.value.message)
  cb(result.value)
}

function uploadLocalFile () { events.EventEmitter.call(this) }
util.inherits(uploadLocalFile, events.EventEmitter)

/**
 * uploadLocalFile is responsible for using webdriver protocol to upload a local
 * file to a remote Selenium server for use in testing uploads.
 *
 * @argument inputSelector Input selector for the file input to upload with
 * @argument filePath Local path to the file used for uploading
 */
uploadLocalFile.prototype.command = function uploadLocalFile (inputSelector, filePath) {
  const self = this
  const Nightwatch = this.client
  const api = this.api

  const uploadRemote = cb => {
    let buffers = []
    let zip = archiver('zip')
    zip
      .on('data', data => { buffers.push(data) })
      .on('error', err => { throw err })
      .on('finish', () => {
        const file = Buffer.concat(buffers).toString('base64')
        api.session(session => {
          const opt = {
            path: `/session/${session.sessionId}/file`,
            method: 'POST',
            data: { file }
          }
          Nightwatch.transport.runProtocolAction(opt).then(handleResult(cb))
        })
      })

    const name = path.basename(filePath)
    zip.file(filePath, { name })
    zip.finalize()
  }

  uploadRemote(tempUrl => {
    api.setValue(inputSelector, tempUrl, () => self.emit('complete'))
  })

  return self
}

module.exports = uploadLocalFile
