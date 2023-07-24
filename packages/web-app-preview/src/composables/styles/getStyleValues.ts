import { StyleCategoryType } from 'web-app-preview/src/helpers'

export const getStyleValues = (styles: StyleCategoryType[]) => {
  const brightness = styles[0].value / 100
  const contrast = styles[1].value / 100
  const saturation = styles[2].value / 100
  const grayscale = styles[3].value / 100
  const invert = styles[4].value / 100

  const exposure = styles[5].value / 100
  const highlights = styles[6].value / 100
  const shadows = styles[7].value / 100

  const computedBrightness = Math.max(
    brightness + exposure + highlights * (2 / 5) - shadows + 1,
    0.5
  )
  const computedContrast = Math.max(contrast + exposure + highlights + shadows + 1, 0.5)
  const computedSaturation = Math.max(saturation - highlights / 5 + 1, 0.3)
  const computedGrayscale = Math.max(grayscale, 0)
  const computedInvert = Math.max(invert, 0)
  return {
    computedBrightness,
    computedContrast,
    computedSaturation,
    computedGrayscale,
    computedInvert
  }
}
