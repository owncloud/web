import { AdjustmentParametersCategoryType } from 'web-app-preview/src/helpers'
import { useAdjustmentParametersValues } from './useAdjustmentParametersValues'

export const useCSSImageAdjustmentParameters = (
  adjustmentParams: AdjustmentParametersCategoryType[]
): string => {
  const {
    computedBrightness,
    computedContrast,
    computedSaturation,
    computedGrayscale,
    computedInvert
  } = useAdjustmentParametersValues(adjustmentParams)
  const adjustmentParametersString = `filter: brightness(${computedBrightness}) contrast(${computedContrast}) saturate(${computedSaturation}) grayscale(${computedGrayscale}) invert(${computedInvert})`
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
    computedInvert
  } = useAdjustmentParametersValues(adjustmentParams)
  const adjustmentParametersString = `brightness(${computedBrightness}) contrast(${computedContrast}) saturate(${computedSaturation}) grayscale(${computedGrayscale}) invert(${computedInvert})`
  return adjustmentParametersString
}
