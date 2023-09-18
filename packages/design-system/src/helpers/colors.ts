/**
 * Converts hex to rgb
 * @param {string} hex: The hex color value (with or without #)
 * @return {Array<number>|null} The converted rgb array
 **/
export function hexToRgb(hex: string): Array<number> | null {
  hex = hex.startsWith('#') ? hex : `#${hex}`
  let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : null
}

/**
 * Converts rgb to hex
 * @param {Array<number>} rgbArray: The rgb color
 * @return {string} The converted hex value
 **/
export function rgbToHex(rgbArray: Array<number>): string {
  const [r, g, b] = rgbArray
  const rHex = r.toString(16).padStart(2, '0')
  const gHex = g.toString(16).padStart(2, '0')
  const bHex = b.toString(16).padStart(2, '0')
  return `#${rHex}${gHex}${bHex}`
}

function shadeValue(value: number, percent: number): string {
  let a = (value * (100 + percent)) / 100
  a = a < 255 ? a : 255
  a = Math.round(a)
  return a.toString(16).length == 1 ? '0' + a.toString(16) : a.toString(16)
}

/**
 * Dim or brighten a hex color
 * @param {string} rgb: The rgb color value
 * @return {string} The brightened or dimmed hex color
 **/
export function shadeColor(rgb: Array<number>, percent: number): string {
  let r = rgb[0]
  let g = rgb[1]
  let b = rgb[2]

  return `#${shadeValue(r, percent)}${shadeValue(g, percent)}${shadeValue(b, percent)}`
}

/**
 * Get the luminance of an rgb color
 * @param {Array<number>} rgb: The rgb value as an array
 * @return {Number} Returns value between 0 and 1, where 1 is white
 **/
export function getLuminanace(rgb: Array<number>): number {
  const mappedRgb = rgb.map((v) => {
    const val = v / 255
    return val <= 0.03928 ? val / 12.92 : ((val + 0.055) / 1.055) ** 2.4
  })
  return Number((0.2126 * mappedRgb[0] + 0.7152 * mappedRgb[1] + 0.0722 * mappedRgb[2]).toFixed(3))
}

/**
 * Get the contrast ratio between two rgb colors
 * @param {Array<number>} rgbColorA: The first rgb value as an array
 * @param {Array<number>} rgbColorB: The second rgb value as an array
 * @return {Number} Returns value between 1 and 21, where 1 is no contrast and 21 is max contrast
 **/
export function getContrastRatio(rgbColorA: Array<number>, rgbColorB: Array<number>): number {
  const lumA = getLuminanace(rgbColorA)
  const lumB = getLuminanace(rgbColorB)

  return (Math.max(lumA, lumB) + 0.05) / (Math.min(lumA, lumB) + 0.05)
}

/**
 * Gives you a random hashed color for a string, e.g. if you give it 'owncloud' it will always return the same color
 * @param {string} name: Can be any string
 * @return {string} Returns a hex color
 **/
export function generateHashedColorForString(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return `#${(hash & 0x00ffffff).toString(16).toUpperCase()}`
}

/**
 * Adjusts a given color to match the contrast ratio of another color
 * @param {Array<number>} targetColorRgb: color to adjust
 * @param {Array<number>} associatedColorRgb: brightest reference color
 * @param {Array<number>} desiredRatio: desired contrast ratio
 * @return {string} Returns a rgb color array
 **/
export function setDesiredContrastRatio(
  targetColorRgb: Array<number>,
  associatedColorRgb: Array<number>,
  desiredRatio: number,
  dim = true
): Array<number> {
  const ratio = getContrastRatio(targetColorRgb, associatedColorRgb)
  if (Math.abs(desiredRatio - ratio) <= 0.3) {
    return targetColorRgb
  }
  if (ratio < desiredRatio) {
    return setDesiredContrastRatio(
      hexToRgb(shadeColor(targetColorRgb, -1)),
      associatedColorRgb,
      desiredRatio,
      true
    )
  }
  return setDesiredContrastRatio(
    hexToRgb(shadeColor(targetColorRgb, 1)),
    associatedColorRgb,
    desiredRatio,
    false
  )
}
