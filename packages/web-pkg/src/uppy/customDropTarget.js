const DropTarget = require('@uppy/drop-target')

/**
 * Custom Drop Target plugin
 *
 * It adds the possibility to have a custom method for adding files to uppy.
 */
module.exports = class CustomDropTarget extends DropTarget {
  addFiles = (files) => {
    if (this.opts.addFilesToUppy) {
      this.opts.addFilesToUppy(files)
      return
    }

    const descriptors = files.map((file) => {
      return {
        source: this.id,
        name: file.name,
        type: file.type,
        data: file,
        meta: {
          relativePath: file.relativePath || null
        }
      }
    })

    try {
      this.uppy.addFiles(descriptors)
    } catch (err) {
      this.uppy.log(err)
    }
  }
}
