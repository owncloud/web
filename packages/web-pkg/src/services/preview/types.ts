import { Resource, SpaceResource } from '@ownclouders/web-client'

export interface BuildQueryStringOptions {
  preview?: number
  scalingup?: number
  a?: number
  etag?: string
  dimensions?: [number, number]
}

export interface LoadPreviewOptions {
  space: SpaceResource
  resource: Resource
  dimensions?: [number, number]
}

export interface PreviewCapability {
  enabled: boolean
  version: string // version is just a major version, e.g. `v2`
  supportedMimeTypes: string[]
}
