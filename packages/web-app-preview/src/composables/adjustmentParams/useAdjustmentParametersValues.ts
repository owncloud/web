import { AdjustmentParametersCategoryType } from 'web-app-preview/src/helpers'

export const useAdjustmentParametersValues = (
  adjustmentParams: AdjustmentParametersCategoryType[]
) => {
  const brightness = (adjustmentParams[0].value as number) / 100
  const contrast = (adjustmentParams[1].value as number) / 100
  const saturation = (adjustmentParams[2].value as number) / 100
  const grayscale = (adjustmentParams[3].value as number) / 100

  const exposure = (adjustmentParams[4].value as number) / 100
  const highlights = (adjustmentParams[5].value as number) / 100
  const shadows = (adjustmentParams[6].value as number) / 100

  const invert = adjustmentParams[7].value
  const computedBrightness = Math.max(
    brightness + exposure + highlights * (2 / 5) - shadows + 1,
    0.5
  )
  const computedContrast = Math.max(contrast + exposure + highlights + shadows + 1, 0.5)
  const computedSaturation = Math.max(saturation - highlights / 5 + 1, 0.3)
  const computedGrayscale = Math.max(grayscale, 0)
  const computedInvert = invert ? 1 : 0
  return {
    computedBrightness,
    computedContrast,
    computedSaturation,
    computedGrayscale,
    computedInvert
  }
}
