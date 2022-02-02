export const themeNameLight = 'default'
export const themeNameDark = 'default-dark'

export const useDefaultThemeName = (): string => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? themeNameDark : themeNameLight
}
