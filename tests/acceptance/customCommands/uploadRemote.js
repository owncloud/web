const events = require('events')
const fs = require('fs')
const yazl = require('yazl')

class UploadRemote extends events.EventEmitter {
  /**
   * UploadRemote is responsible for using webdriver protocol to upload a local
   * file to a remote Selenium server for use in testing uploads.
   *
   * @param {string} filePath Local path to the file used for uploading
   * @param mtime
   * @param {function (string): void} [callback] - called when file gets uploaded with path to uploaded file
   */
  command(filePath, mtime, callback) {
    const zip = new yazl.ZipFile()
    console.log(filePath)
    zip.addFile(filePath, '~/www/testZip', {
      mtime: new Date(mtime)
    })
    zip.outputStream.pipe(fs.createWriteStream('output.zip')).on('close', function() {
      console.log('done')
    })
    zip.end()
  }
}

module.exports = UploadRemote
