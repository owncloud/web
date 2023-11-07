import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ThemeName } from '../../../../web-runtime/src/composables/theme/useDefaultThemeName'

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

export const useThemeStore = defineStore('theme', () => {
  const commonTheme = ref<CommonTheme | undefined>()
  const currentTheme = ref<WebTheme | undefined>()

  const availableThemes = ref<WebTheme[]>([])

  const hasOnlyOneTheme = computed(() => availableThemes.value.length > 1)

  const hasOnlyTwoThemesForLightDarkMode = computed(
    () =>
      availableThemes.value.length === 2 &&
      availableThemes.value.some((x) => x.isDark === true) &&
      availableThemes.value.some((x) => x.isDark !== true)
  )

  const initializeThemes = (
    themes: WebTheme[],
    newCommonTheme: CommonTheme,
    defaultThemeName: ThemeName
  ) => {
    availableThemes.value = themes
    commonTheme.value = newCommonTheme

    // TODO: Fix this by passing full theme?
    // TODO: Discuss handling (former) default scenario
    setCurrentTheme(availableThemes.value.find((x) => x.general.name === defaultThemeName))
  }

  const setCurrentTheme = (theme: WebTheme) => {
    currentTheme.value = theme
  }

  return {
    availableThemes,
    currentTheme,
    hasOnlyOneTheme,
    hasOnlyTwoThemesForLightDarkMode,
    initializeThemes,
    setCurrentTheme
  }
})
