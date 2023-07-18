export type CachedFile = {
  id: string
  name: string
  url: string
  ext: string
  mimeType: string
  isVideo: boolean
  isImage: boolean
  isAudio: boolean
}

export type StyleVariableType = {
  name: string
  maxValue: number
  minValue: number
}

export type StyleCategoryType = StyleVariableType & {
  value: number
}

export type ImageStyles = {
  brightness: number
  contrast: number
  blur: number
  saturation: number
  exposure: number
  highlights: number
  shadows: number
}
