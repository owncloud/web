interface ThumbnailCapability {
  enabled: boolean
  version: string // version is just a major version, e.g. `v2`
  supportedMimeTypes: string[]
}

export class ThumbnailService {
  serverUrl: string
  capability?: ThumbnailCapability

  public initialize(thumbnailCapability: ThumbnailCapability = null): void {
    this.capability = thumbnailCapability
  }

  public get available(): boolean {
    return !!this.capability?.version
  }

  private get supportedMimeTypes() {
    return this.capability?.supportedMimeTypes || []
  }

  public isMimetypeSupported(mimeType: string, onlyImages = false) {
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
