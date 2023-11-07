import { defineStore } from 'pinia'
import { ref, computed, unref } from 'vue'
import { useLocalStorage, usePreferredDark } from '@vueuse/core'

interface CommonTheme {
  name: string
  slogan: string
  logo: string
  accessDeniedHelpUrl: string
}

interface WebTheme {
  general: {
    name: string
    slogan: string
    privacyUrl: string
    imprintUrl: string
  }
  appBanner: {
    title: string
    publisher: string
    additionalInformation: string
    ctaText: string
    icon: string
    appScheme: string
  }
  isDark: boolean
  logo: {
    topbar: string
    favicon: string
    login: string
    notFound: string
  }
  loginPage: {
    autoRedirect: boolean
    backgroundImg: string
  }
  // TODO: Refine designTokens according to existing theme.json contents
  designTokens: {
    colorPalette: Record<string, string>
  }
}

const themeNameLight = 'default'
const themeNameDark = 'default-dark'

export const useThemeStore = defineStore('theme', () => {
  const commonTheme = ref<CommonTheme | undefined>()
  const currentTheme = ref<WebTheme | undefined>()

  const availableThemes = ref<WebTheme[]>([])

  const hasOnlyOneTheme = computed(() => availableThemes.value.length > 1)

  const hasOnlyTwoThemesForLightDarkMode = computed(
    () =>
      availableThemes.value.length === 2 &&
      availableThemes.value.some((t) => t.isDark === true) &&
      availableThemes.value.some((t) => t.isDark !== true)
  )

  const initializeThemes = (themes: WebTheme[], newCommonTheme: CommonTheme) => {
    availableThemes.value = themes
    commonTheme.value = newCommonTheme

    const currentThemeName = useLocalStorage('oc_currentThemeName', null) // note: use null as default so that we can fall back to system preferences
    // Set default theme name as fallback
    if (unref(currentThemeName) === null) {
      const isDark = usePreferredDark()
      currentThemeName.value = isDark.value ? themeNameDark : themeNameLight
    }

    // TODO: Fix this by passing full theme?
    // TODO: Discuss handling (former) default scenario
    setAndApplyTheme(availableThemes.value.find((t) => t.general.name === currentThemeName.value))
  }

  const setAndApplyTheme = (theme: WebTheme) => {
    currentTheme.value = theme

    for (const param in currentTheme.value.designTokens.colorPalette) {
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
