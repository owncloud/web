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
  valueType: AdjustmentParametersTypeEnum
  maxValue: number
  minValue: number
}

export type AdjustmentParametersCategoryType = AdjustmentParameterType & {
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

export type MediaGalleryFile = {
  name: string
  url: string
  id: string | number
  mimeType: string
}
