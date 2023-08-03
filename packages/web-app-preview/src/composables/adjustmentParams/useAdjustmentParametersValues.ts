import { AdjustmentParametersCategoryType } from 'web-app-preview/src/helpers'

export const useAdjustmentParametersValues = (
  adjustmentParams: AdjustmentParametersCategoryType[]
) => {
  const brightness = adjustmentParams[0].value / 100
  const contrast = adjustmentParams[1].value / 100
  const saturation = adjustmentParams[2].value / 100
  const grayscale = adjustmentParams[3].value / 100

  const exposure = adjustmentParams[4].value / 100
  const highlights = adjustmentParams[5].value / 100
  const shadows = adjustmentParams[6].value / 100

  const invert = adjustmentParams[7].value
  const computedBrightness = Math.max(
    brightness + exposure + highlights * (2 / 5) - shadows + 1,
    0.5
  )
  const computedContrast = Math.max(contrast + exposure + highlights + shadows + 1, 0.5)
  const computedSaturation = Math.max(saturation - highlights / 5 + 1, 0.3)
  const computedGrayscale = Math.max(grayscale, 0)
  const computedInvert = Math.max(Math.min(invert, 1), 0)
  return {
    computedBrightness,
    computedContrast,
    computedSaturation,
    computedGrayscale,
    computedInvert
  }
}
