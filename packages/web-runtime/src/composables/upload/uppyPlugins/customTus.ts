import Tus from '@uppy/tus'

export class CustomTus extends Tus {
  upload(file) {
    if (file.meta.tusEndpoint) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.opts.endpoint = file.meta.tusEndpoint
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return super.upload(file)
  }
}
