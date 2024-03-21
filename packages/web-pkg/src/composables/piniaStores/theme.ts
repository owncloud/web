import merge from 'deepmerge'
import { defineStore } from 'pinia'
import { ref, computed, unref } from 'vue'
import { useLocalStorage, usePreferredDark } from '@vueuse/core'
import { z } from 'zod'
import { applyCustomProp } from 'design-system/src/'

const AppBanner = z.object({
  title: z.string().optional(),
  publisher: z.string().optional(),
  additionalInformation: z.string().optional(),
  ctaText: z.string().optional(),
  icon: z.string().optional(),
  appScheme: z.string().optional()
})

const CommonSection = z.object({
  name: z.string(),
  slogan: z.string(),
  logo: z.string(),
  urls: z.object({
    accessDeniedHelp: z.string(),
    imprint: z.string(),
    privacy: z.string()
  })
})

const DesignTokens = z.object({
  breakpoints: z.record(z.string()).optional(),
  colorPalette: z.record(z.string()).optional(),
  fontFamily: z.string().optional(),
  fontSizes: z.record(z.string()).optional(),
  sizes: z.record(z.string()).optional(),
  spacing: z.record(z.string()).optional()
})

const LoginPage = z.object({
  autoRedirect: z.boolean(),
  backgroundImg: z.string()
})

const Logo = z.object({
  topbar: z.string(),
  favicon: z.string(),
  login: z.string(),
  notFound: z.string().optional()
})

const ThemeDefaults = z.object({
  appBanner: AppBanner.optional(),
  common: CommonSection.optional(),
  designTokens: DesignTokens,
  loginPage: LoginPage,
  logo: Logo
})

const WebTheme = z.object({
  appBanner: AppBanner.optional(),
  common: CommonSection.optional(),
  designTokens: DesignTokens.optional(),
  isDark: z.boolean(),
  name: z.string(),
  loginPage: LoginPage.optional(),
  logo: Logo.optional()
})

export const WebThemeConfig = z.object({
  defaults: ThemeDefaults,
  themes: z.array(WebTheme)
})

export const ThemingConfig = z.object({
  common: CommonSection.optional(),
  clients: z.object({
    web: WebThemeConfig
  })
})

type WebThemeType = z.infer<typeof WebTheme>
type WebThemeConfigType = z.infer<typeof WebThemeConfig>

const themeStorageKey = 'oc_currentThemeName'

export const useThemeStore = defineStore('theme', () => {
  const currentThemeName = useLocalStorage(themeStorageKey, null) // null as default to make fallback possible
  const currentLocalStorageThemeName = useLocalStorage(themeStorageKey, null)

  const isDark = usePreferredDark()

  const currentTheme = ref<WebThemeType | undefined>()

  const availableThemes = ref<WebThemeType[]>([])

  const hasOnlyOneTheme = computed(() => unref(availableThemes).length === 1)

  const hasOnlyTwoThemesForLightDarkMode = computed(
    () =>
      unref(availableThemes).length === 2 &&
      unref(availableThemes).some((t) => t.isDark === true) &&
      unref(availableThemes).some((t) => t.isDark !== true)
  )

  const initializeThemes = (themeConfig: WebThemeConfigType) => {
    availableThemes.value = themeConfig.themes.map((theme) => merge(themeConfig.defaults, theme))

    if (unref(currentThemeName) === null) {
      const theme =
        unref(availableThemes).find((t) => t.isDark === unref(isDark)) || unref(availableThemes)[0]
      currentThemeName.value = theme.name
    }

    setAndApplyTheme(
      unref(availableThemes).find((t) => t.name === unref(currentThemeName)) ||
        availableThemes.value[0]
    )
  }

  const setAndApplyTheme = (theme: WebThemeType) => {
    currentTheme.value = theme
    currentLocalStorageThemeName.value = unref(currentTheme).name

    const customizableDesignTokens = [
      { name: 'breakpoints', prefix: 'breakpoint' },
      { name: 'colorPalette', prefix: 'color' },
      { name: 'fontSizes', prefix: 'font-size' },
      { name: 'sizes', prefix: 'size' },
      { name: 'spacing', prefix: 'spacing' }
    ]

    applyCustomProp('font-family', unref(currentTheme).designTokens.fontFamily)

    customizableDesignTokens.forEach((token) => {
      for (const param in unref(currentTheme).designTokens[token.name]) {
        applyCustomProp(
          `${token.prefix}-${param}`,
          unref(currentTheme).designTokens[token.name][param]
        )
      }
    })
  }

  // This should only be used with hasOnlyTwoThemesForLightDarkMode - we know there's exactly two themes, one with darkMode and one without
  const toggleTheme = () => {
    setAndApplyTheme(unref(availableThemes).find((t) => t.isDark !== unref(currentTheme).isDark))
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
