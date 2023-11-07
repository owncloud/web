export const themeNameLight = 'default'
export const themeNameDark = 'default-dark'

export type ThemeName = typeof themeNameDark | typeof themeNameLight

export const useDefaultThemeName = (): string => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? themeNameDark : themeNameLight
}
