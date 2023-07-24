import { StyleCategoryType } from 'web-app-preview/src/helpers'
import { getStyleValues } from './getStyleValues'

export const useCSSImageStyles = (styles: StyleCategoryType[]): string => {
  const {
    computedBrightness,
    computedContrast,
    computedSaturation,
    computedGrayscale,
    computedInvert
  } = getStyleValues(styles)
  const styleString = `filter: brightness(${computedBrightness}) contrast(${computedContrast}) saturate(${computedSaturation}) grayscale(${computedGrayscale}) invert(${computedInvert})`
  return styleString
}

export const useImageStyles = (styles: StyleCategoryType[]): string => {
  const {
    computedBrightness,
    computedContrast,
    computedSaturation,
    computedGrayscale,
    computedInvert
  } = getStyleValues(styles)
  const styleString = `brightness(${computedBrightness}) contrast(${computedContrast}) saturate(${computedSaturation}) grayscale(${computedGrayscale}) invert(${computedInvert})`
  return styleString
}
