interface ThumbnailCapability {
  enabled: boolean
  version: string // version is just a major version, e.g. `v2`
  supportedMimeTypes: string[]
}

export class ThumbnailService {
  serverUrl: string
  capability?: ThumbnailCapability

  public initialize(thumbnailCapability: ThumbnailCapability): void {
    this.capability = thumbnailCapability
  }

  public get available(): boolean {
    return !!this.capability?.version
  }

  public isMimetypeSupported(mimeType: string, onlyImages = false) {
    return onlyImages
      ? mimeType.startsWith('image/') && this.capability.supportedMimeTypes.includes(mimeType)
      : this.capability.supportedMimeTypes.includes(mimeType)
  }
}

export const thumbnailService = new ThumbnailService()
