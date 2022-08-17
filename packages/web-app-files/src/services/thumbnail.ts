export class ThumbnailService {
  supportedMimeTypes: string[]

  public initialize(supportedMimeTypes: string[]): void {
    this.supportedMimeTypes = supportedMimeTypes.map((mimeType) => mimeType.toLowerCase())
  }

  public get available(): boolean {
    return true
  }

  public isMimetypeSupported(mimeType: string, onlyImages = false) {
    if (!this.supportedMimeTypes.length) {
      return true
    }

    const mimeTypes = this.getSupportedMimeTypes(onlyImages ? 'image/' : null)
    return mimeTypes.includes(mimeType)
  }

  public getSupportedMimeTypes(filter?: string) {
    if (!filter) {
      return this.supportedMimeTypes
    }
    return this.supportedMimeTypes.filter((mimeType) => mimeType.startsWith(filter))
  }
}

export const thumbnailService = new ThumbnailService()
