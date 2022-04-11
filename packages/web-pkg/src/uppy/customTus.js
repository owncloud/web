const Tus = require('@uppy/tus')

/**
 * Custom Tus plugin
 *
 * It can set the upload endpoint dynamically per file.
 */
module.exports = class CustomTus extends Tus {
  upload(file) {
    if (file.meta.tusEndpoint) {
      this.opts.endpoint = file.meta.tusEndpoint
    }
    return super.upload(file)
  }
}
