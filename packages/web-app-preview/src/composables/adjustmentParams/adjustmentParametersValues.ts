import { AdjustmentParametersCategoryType } from 'web-app-preview/src/helpers'

export const adjustmentParametersValues = (
  adjustmentParams: AdjustmentParametersCategoryType[]
) => {
  const brightness =
    (adjustmentParams.find((param) => param.name === 'Brightness').value as number) / 100
  const contrast =
    (adjustmentParams.find((param) => param.name === 'Contrast').value as number) / 100
  const saturation =
    (adjustmentParams.find((param) => param.name === 'Saturation').value as number) / 100
  const grayscale =
    (adjustmentParams.find((param) => param.name === 'Grayscale').value as number) / 100
  const sepia = (adjustmentParams.find((param) => param.name === 'Sepia').value as number) / 100
  const hueRotate = adjustmentParams.find((param) => param.name === 'Hue-rotate').value as number

  const exposure =
    (adjustmentParams.find((param) => param.name === 'Exposure').value as number) / 100
  const highlights =
    (adjustmentParams.find((param) => param.name === 'Highlights').value as number) / 100
  const cooling = (adjustmentParams.find((param) => param.name === 'Cooling').value as number) / 100
  const vintage = (adjustmentParams.find((param) => param.name === 'Vintage').value as number) / 100
  const dramatic =
    (adjustmentParams.find((param) => param.name === 'Dramatic').value as number) / 100

  const invert = adjustmentParams.find((param) => param.name === 'Invert').value

  const computedBrightness = Math.max(
    brightness +
      exposure +
      highlights * (1 / 10) -
      cooling * (1 / 10) -
      vintage * (1 / 5) -
      dramatic * (3 / 10) +
      1,
    0.5
  )
  const computedContrast = Math.max(
    Math.min(
      contrast +
        exposure +
        highlights * (1 / 2) +
        vintage * (1 / 2) +
        dramatic * (1 / 2) +
        cooling * (1 / 2) +
        1,
      2
    ),
    0.5
  )
  const computedSaturation = Math.max(
    Math.min(saturation - highlights / 10 - cooling * (1 / 2) + 1, 2),
    0.3
  )
  const computedGrayscale = Math.max(Math.min(grayscale, 1), 0)
  const computedSepia = Math.max(Math.min(sepia + vintage * (3 / 5) - cooling * (1 / 2), 1), 0)
  const computedHueRotate = Math.max(Math.min(hueRotate, 360), 0)
  const computedInvert = invert ? 1 : 0

  return {
    computedBrightness,
    computedContrast,
    computedSaturation,
    computedGrayscale,
    computedSepia,
    computedHueRotate,
    computedInvert
  }
}
