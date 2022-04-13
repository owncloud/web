import DropTarget from '@uppy/drop-target'

/**
 * Custom Drop Target plugin
 *
 * It adds the possibility to have a custom method for adding files to uppy.
 */
export class CustomDropTarget extends DropTarget {
  addFiles = (files) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (this.opts.uppyService) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.opts.uppyService.$emit('filesSelected', files)
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
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.uppy.addFiles(descriptors)
    } catch (err) {
      this.uppy.log(err)
    }
  }
}
