import { AdjustmentParametersCategoryType } from 'web-app-preview/src/helpers'
import { adjustmentParametersValues } from './adjustmentParametersValues'

export const useCSSImageAdjustmentParameters = (
  adjustmentParams: AdjustmentParametersCategoryType[]
): string => {
  const {
    computedBrightness,
    computedContrast,
    computedSaturation,
    computedGrayscale,
    computedHueRotate,
    computedSepia,
    computedInvert
  } = adjustmentParametersValues(adjustmentParams)
  const adjustmentParametersString = `filter: brightness(${computedBrightness}) contrast(${computedContrast}) saturate(${computedSaturation}) grayscale(${computedGrayscale}) invert(${computedInvert}) hue-rotate(${computedHueRotate}deg) sepia(${computedSepia})`
  return adjustmentParametersString
}

export const useImageAdjustmentParameters = (
  adjustmentParams: AdjustmentParametersCategoryType[]
): string => {
  const {
    computedBrightness,
    computedContrast,
    computedSaturation,
    computedGrayscale,
    computedHueRotate,
    computedSepia,
    computedInvert
  } = adjustmentParametersValues(adjustmentParams)
  const adjustmentParametersString = `brightness(${computedBrightness}) contrast(${computedContrast}) saturate(${computedSaturation}) grayscale(${computedGrayscale}) invert(${computedInvert}) hue-rotate(${computedHueRotate}deg) sepia(${computedSepia})`
  return adjustmentParametersString
}
