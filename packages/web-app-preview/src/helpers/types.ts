import { AdjustmentParametersCategoryEnum, AdjustmentParametersTypeEnum } from './enums'

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

export type AdjustmentParameterType = {
  name: string
  type: AdjustmentParametersTypeEnum
  maxValue?: number
  minValue?: number
}

export type AdjustmentParametersCategoryType = AdjustmentParameterType & {
  value: number | boolean
  category: AdjustmentParametersCategoryEnum
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
