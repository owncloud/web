export class ThumbnailService {
  supportedMimeTypes: string[] = []
  available = false

  public initialize(supportedMimeTypes: string[], available: boolean): void {
    this.supportedMimeTypes = supportedMimeTypes
    this.available = available
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
