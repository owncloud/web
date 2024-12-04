<template>
  <div>
    <h2 class="oc-py-s" v-text="$gettext('Appearance')" />
    <div>
      <div class="oc-flex oc-flex-middle">
        <h3 v-text="$gettext('Logo')" />
        <oc-button
          v-if="menuItems.length"
          :id="`logo-context-btn`"
          v-oc-tooltip="$gettext('Show context menu')"
          :aria-label="$gettext('Show context menu')"
          appearance="raw"
          class="oc-ml-s"
        >
          <oc-icon name="more-2" />
        </oc-button>
        <oc-drop
          :drop-id="`space-context-drop`"
          :toggle="`#logo-context-btn`"
          mode="click"
          close-on-click
          padding-size="small"
        >
          <context-action-menu :menu-sections="menuSections" :action-options="actionOptions" />
        </oc-drop>
      </div>
      <div>
        <div class="logo-wrapper">
          <img alt="" :src="currentTheme.logo.topbar" class="oc-p-xs" />
        </div>
        <input
          id="logo-upload-input"
          ref="logoInput"
          type="file"
          name="file"
          tabindex="-1"
          :accept="supportedLogoMimeTypesAcceptValue"
          @change="uploadImage"
        />
      </div>
      <div>
        <h3 v-text="$gettext('Theme')" />
        <oc-button
          variation="primary"
          appearance="filled"
          style="background-color: gold; color: black"
          @click="triggerFileInput"
        >
          Try MaterialUI (Upload JSON File)
        </oc-button>
        <input
          ref="fileInput"
          type="file"
          accept="application/json"
          style="display: none"
          @change="handleFileUpload"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { z } from 'zod'
import { defineComponent, computed, unref, VNodeRef, ref } from 'vue'
import { ContextActionMenu, useThemeStore } from '@ownclouders/web-pkg'
import {
  useGeneralActionsResetLogo,
  useGeneralActionsUploadLogo
} from '../../composables/actions/general'
import { supportedLogoMimeTypes } from '../../defaults'
import { storeToRefs } from 'pinia'

export default defineComponent({
  name: 'AppearanceSection',
  components: {
    ContextActionMenu
  },
  setup() {
    const themeStore = useThemeStore()
    const { currentTheme } = storeToRefs(themeStore)

    const logoInput: VNodeRef = ref(null)

    const { actions: resetLogoActions } = useGeneralActionsResetLogo()
    const { actions: uploadLogoActions, uploadImage } = useGeneralActionsUploadLogo({
      imageInput: logoInput
    })

    const menuItems = computed(() =>
      [...unref(uploadLogoActions), ...unref(resetLogoActions)].filter((i) => i.isVisible())
    )

    const actionOptions = computed(() => ({
      resources: unref(menuItems)
    }))

    const menuSections = computed(() => [
      {
        name: 'primaryActions',
        items: unref(menuItems)
      }
    ])

    const supportedLogoMimeTypesAcceptValue = supportedLogoMimeTypes.join(',')

    const colorSchemeSchema = z.object({
      primary: z.string(),
      surfaceTint: z.string(),
      onPrimary: z.string(),
      primaryContainer: z.string(),
      onPrimaryContainer: z.string(),
      secondary: z.string(),
      onSecondary: z.string(),
      secondaryContainer: z.string(),
      onSecondaryContainer: z.string(),
      tertiary: z.string(),
      onTertiary: z.string(),
      tertiaryContainer: z.string(),
      onTertiaryContainer: z.string(),
      error: z.string(),
      onError: z.string(),
      errorContainer: z.string(),
      onErrorContainer: z.string(),
      background: z.string(),
      onBackground: z.string(),
      surface: z.string(),
      onSurface: z.string(),
      surfaceVariant: z.string(),
      onSurfaceVariant: z.string(),
      outline: z.string(),
      outlineVariant: z.string(),
      shadow: z.string(),
      scrim: z.string(),
      inverseSurface: z.string(),
      inverseOnSurface: z.string(),
      inversePrimary: z.string(),
      primaryFixed: z.string(),
      onPrimaryFixed: z.string(),
      primaryFixedDim: z.string(),
      onPrimaryFixedVariant: z.string(),
      secondaryFixed: z.string(),
      onSecondaryFixed: z.string(),
      secondaryFixedDim: z.string(),
      onSecondaryFixedVariant: z.string(),
      tertiaryFixed: z.string(),
      onTertiaryFixed: z.string(),
      tertiaryFixedDim: z.string(),
      onTertiaryFixedVariant: z.string(),
      surfaceDim: z.string(),
      surfaceBright: z.string(),
      surfaceContainerLowest: z.string(),
      surfaceContainerLow: z.string(),
      surfaceContainer: z.string(),
      surfaceContainerHigh: z.string(),
      surfaceContainerHighest: z.string()
    })

    const schemeCollectionSchema = z.record(colorSchemeSchema)

    const rootSchema = z.object({
      schemes: schemeCollectionSchema
    })

    const fileInput = ref<HTMLInputElement | null>(null)

    const triggerFileInput = () => {
      fileInput.value?.click()
    }

    const handleFileUpload = (event: Event) => {
      const input = event.target as HTMLInputElement
      const file = input.files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = async () => {
        try {
          const parsedData = JSON.parse(reader.result as string)
          const tryThemes = rootSchema.parse(parsedData)

          const oldCurrentTheme = unref(currentTheme)

          const newThemes = []

          Object.keys(tryThemes['schemes']).forEach((themeName) => {
            const tryTheme = tryThemes['schemes'][themeName]
            newThemes.push({
              ...oldCurrentTheme,
              designTokens: {
                ...oldCurrentTheme.designTokens,
                colorPalette: tryTheme
              },
              isDark: themeName.includes('dark'),
              name: themeName
            })
          })

          themeStore.resetAllThemes()
          themeStore.initializeMdThemes(newThemes)
        } catch (error) {
          console.error('Error reading or parsing file:', error)
        }
      }
      reader.readAsText(file)
    }

    return {
      fileInput,
      triggerFileInput,
      handleFileUpload,
      actionOptions,
      currentTheme,
      menuItems,
      menuSections,
      supportedLogoMimeTypesAcceptValue,
      uploadImage,
      logoInput
    }
  }
})
</script>

<style lang="scss" scoped>
#logo-upload-input {
  display: none;
}
.logo-wrapper {
  width: 280px;
  min-width: 280px;
  aspect-ratio: 16/9;
  max-height: 158px;

  img {
    border-radius: 10px;
    width: 100%;
    max-height: 100%;
    object-fit: cover;
    background: var(--oc-color-swatch-brand-default);
  }
}
</style>
