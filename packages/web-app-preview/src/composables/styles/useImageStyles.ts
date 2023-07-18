export const useImageStyles = (styles): string => {
  const brightness = styles[0].value
  const contrast = styles[1].value
  const saturation = styles[2].value
  const blur = styles[3].value
  const exposure = styles[4].value
  const highlights = styles[5].value
  const shadows = styles[6].value

  const computedBrightness = Math.max(
    (brightness + exposure + highlights * (2 / 5) - shadows) / 100 + 1,
    0
  )
  const computedContrast = Math.max((contrast + exposure + highlights + shadows) / 100 + 1, 0)
  const computedSaturation = Math.max((saturation - highlights / 5) / 100 + 1, 0)
  const computedBlur = `${blur / 10}px`

  return `filter: brightness(${computedBrightness}) contrast(${computedContrast}) saturate(${computedSaturation}) blur(${computedBlur})`
}
