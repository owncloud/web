import { adjustmentParametersCategoryType } from 'web-app-preview/src/helpers'
import { getAdjustmentParametersValues } from './getAdjustmentParametersValues'

export const useCSSImageAdjustmentParameters = (
  adjustmentParams: adjustmentParametersCategoryType[]
): string => {
  const {
    computedBrightness,
    computedContrast,
    computedSaturation,
    computedGrayscale,
    computedInvert
  } = getAdjustmentParametersValues(adjustmentParams)
  const adjustmentParametersString = `filter: brightness(${computedBrightness}) contrast(${computedContrast}) saturate(${computedSaturation}) grayscale(${computedGrayscale}) invert(${computedInvert})`
  return adjustmentParametersString
}

export const useImageAdjustmentParameters = (
  adjustmentParams: adjustmentParametersCategoryType[]
): string => {
  const {
    computedBrightness,
    computedContrast,
    computedSaturation,
    computedGrayscale,
    computedInvert
  } = getAdjustmentParametersValues(adjustmentParams)
  const adjustmentParametersString = `brightness(${computedBrightness}) contrast(${computedContrast}) saturate(${computedSaturation}) grayscale(${computedGrayscale}) invert(${computedInvert})`
  return adjustmentParametersString
}
