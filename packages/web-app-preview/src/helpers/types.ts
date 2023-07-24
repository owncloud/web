import { AdjustmentParametersCategoryEnum } from './enums'

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

export type adjustmentParameterType = {
  name: string
  maxValue: number
  minValue: number
}

export type adjustmentParametersCategoryType = adjustmentParameterType & {
  value: number
  type: AdjustmentParametersCategoryEnum
}

export type ImageAdjustmentParameters = {
  brightness: number
  contrast: number
  saturation: number
  grayscale: number
  invert: number
  exposure: number
  highlights: number
  shadows: number
}
