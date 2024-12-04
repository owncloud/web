import merge from 'deepmerge'
import { defineStore } from 'pinia'
import { computed, ref, unref } from 'vue'
import { useLocalStorage, usePreferredDark } from '@vueuse/core'
import { z } from 'zod'
import { applyCustomProp } from '@ownclouders/design-system/helpers'
import { ShareRole } from '@ownclouders/web-client'

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
  }),
  shareRoles: z.record(
    z.string(),
    z.object({
      iconName: z.string()
    })
  )
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

export type WebThemeType = z.infer<typeof WebTheme>
export type WebThemeConfigType = z.infer<typeof WebThemeConfig>

const themeStorageKey = 'oc_currentThemeName'

export const useThemeStore = defineStore('theme', () => {
  const currentLocalStorageThemeName = useLocalStorage(themeStorageKey, null)

  const isDark = usePreferredDark()

  const currentTheme = ref<WebThemeType | undefined>()

  const availableThemes = ref<WebThemeType[]>([])

  const resetAllThemes = () => {
    availableThemes.value = []
    currentTheme.value = undefined
  }

  const initializeMdThemes = (themeConfig: unknown) => {
    availableThemes.value = Object.keys(themeConfig).map((key) => {
      return themeConfig[key]
    })

    setThemeFromStorageOrSystem()
  }

  const initializeThemes = (themeConfig: WebThemeConfigType) => {
    availableThemes.value = themeConfig.themes.map((theme) => merge(themeConfig.defaults, theme))
    setThemeFromStorageOrSystem()
  }

  const setThemeFromStorageOrSystem = () => {
    const firstLightTheme = unref(availableThemes).find((theme) => !theme.isDark)
    const firstDarkTheme = unref(availableThemes).find((theme) => theme.isDark)
    setAndApplyTheme(
      unref(availableThemes).find((t) => t.name === unref(currentLocalStorageThemeName)) ||
        (unref(isDark) ? firstDarkTheme : firstLightTheme) ||
        unref(availableThemes)[0],
      false
    )
  }

  const setAutoSystemTheme = () => {
    currentLocalStorageThemeName.value = null
    setThemeFromStorageOrSystem()
  }

  const isCurrentThemeAutoSystem = computed(() => {
    return currentLocalStorageThemeName.value === null
  })

  const setAndApplyTheme = (theme: WebThemeType, updateStorage = true) => {
    currentTheme.value = theme
    if (updateStorage) {
      currentLocalStorageThemeName.value = unref(currentTheme).name
    }

    const customizableDesignTokens = [
      { name: 'breakpoints', prefix: 'breakpoint' },
      { name: 'colorPalette', prefix: 'color' },
      { name: 'fontSizes', prefix: 'font-size' },
      { name: 'sizes', prefix: 'size' },
      { name: 'spacing', prefix: 'spacing' }
    ] as const

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

  const getRoleIcon = (role: ShareRole) => {
    return unref(currentTheme).common?.shareRoles[role.id]?.iconName || 'user'
  }

  return {
    availableThemes,
    currentTheme,
    initializeThemes,
    initializeMdThemes,
    resetAllThemes,
    setAndApplyTheme,
    setAutoSystemTheme,
    isCurrentThemeAutoSystem,
    getRoleIcon
  }
})
