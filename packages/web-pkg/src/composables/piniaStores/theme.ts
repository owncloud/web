import merge from 'deepmerge'
import { defineStore } from 'pinia'
import { ref, computed, unref } from 'vue'
import { useLocalStorage, usePreferredDark } from '@vueuse/core'

interface AppBanner {
  title: string
  publisher: string
  additionalInformation: string
  ctaText: string
  icon: string
  appScheme: string
}

interface CommonSection {
  name: string
  slogan: string
  logo: string
  urls: {
    accessDeniedHelp: string
    imprint: string
    privacy: string
  }
}

interface DesignTokens {
  breakpoints?: Record<string, string>
  colorPalette?: Record<string, string>
  fontSizes?: Record<string, string>
  sizes?: Record<string, string>
  spacing?: Record<string, string>
}

interface LoginPage {
  autoRedirect: boolean
  backgroundImg: string
}

interface Logo {
  topbar: string
  favicon: string
  login: string
  notFound: string
}

interface ThemeDefaults {
  appBanner?: AppBanner
  common: CommonSection
  designTokens: DesignTokens
  loginPage: LoginPage
  logo: Logo
}

interface WebTheme {
  appBanner?: AppBanner
  common?: CommonSection
  designTokens: DesignTokens

  isDark: boolean
  name: string
  loginPage?: LoginPage
  logo?: Logo
}

interface WebThemeConfig {
  defaults: ThemeDefaults
  themes: WebTheme[]
}

const themeStorageKey = 'oc_currentThemeName'

export const useThemeStore = defineStore('theme', () => {
  const currentTheme = ref<WebTheme | undefined>()

  const availableThemes = ref<WebTheme[]>([])

  const hasOnlyOneTheme = computed(() => availableThemes.value.length === 1)

  const hasOnlyTwoThemesForLightDarkMode = computed(
    () =>
      availableThemes.value.length === 2 &&
      availableThemes.value.some((t) => t.isDark === true) &&
      availableThemes.value.some((t) => t.isDark !== true)
  )

  const initializeThemes = (themeConfig: WebThemeConfig) => {
    availableThemes.value = themeConfig.themes.map((theme) => merge(themeConfig.defaults, theme))

    const currentThemeName = useLocalStorage(themeStorageKey, null) // null as default to make fallback possible

    if (unref(currentThemeName) === null) {
      const isDark = usePreferredDark()
      currentThemeName.value = availableThemes.value.find((t) => t.isDark === isDark.value)
    }

    setAndApplyTheme(
      availableThemes.value.find((t) => t.name === currentThemeName.value) ||
        availableThemes.value[0]
    )
  }

  const setAndApplyTheme = (theme: WebTheme) => {
    currentTheme.value = theme
    const currentLocalStorageThemeName = useLocalStorage(themeStorageKey, theme.name)
    currentLocalStorageThemeName.value = currentTheme.value.name

    // TODO: Shouldn't we loop over all designTokens and set them?
    for (const param in currentTheme.value.designTokens?.colorPalette) {
      ;(document.querySelector(':root') as HTMLElement).style.setProperty(
        `--oc-color-${param}`,
        theme.designTokens.colorPalette[param]
      )
    }
  }

  // This should only be used with hasOnlyTwoThemesForLightDarkMode - we know there's exactly two themes, one with darkMode and one without
  const toggleTheme = () => {
    setAndApplyTheme(availableThemes.value.find((t) => t.isDark !== currentTheme.value.isDark))
  }

  return {
    availableThemes,
    currentTheme,
    hasOnlyOneTheme,
    hasOnlyTwoThemesForLightDarkMode,
    initializeThemes,
    setAndApplyTheme,
    toggleTheme
  }
})
