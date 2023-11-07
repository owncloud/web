<template>
  <!-- TODO: Only show if themes.length === 2 && 1 theme isDark === true && 1 theme isDark === false -->
  <oc-button
    v-oc-tooltip="buttonLabel"
    class="themeswitcher-btn"
    :aria-label="buttonLabel"
    appearance="raw-inverse"
    variation="brand"
    @click="toggleTheme"
  >
    <span class="oc-visible@s" :aria-label="switchLabel" />
    <oc-icon :name="switchIcon" fill-type="line" variation="inherit" />
  </oc-button>
  <!-- TODO: Add button + ocdrop for >2 themes or (themes.length === 2 && both isDark || !isDark) -->
</template>
<script lang="ts">
import { computed, unref, watch, defineComponent, ref } from 'vue'
import { useGettext } from 'vue3-gettext'
import { useStore, useLocalStorage } from '@ownclouders/web-pkg'
import { themeNameDark, themeNameLight, useDefaultThemeName } from '../../composables'

// TODO: Consider using https://vueuse.org/core/useColorMode/#usecolormode

export default defineComponent({
  setup() {
    const { $gettext } = useGettext()
    const store = useStore()

    const currentThemeName = ref('')

    // TODO: Move to theme store?
    currentThemeName.value = useLocalStorage('oc_currentThemeName', useDefaultThemeName())
    const currentTheme = computed(() => store.getters.configuration.themes[unref(currentThemeName)])
    const applyTheme = (theme) => {
      for (const param in theme.designTokens.colorPalette) {
        ;(document.querySelector(':root') as HTMLElement).style.setProperty(
          `--oc-color-${param}`,
          theme.designTokens.colorPalette[param]
        )
      }
    }

    const buttonLabel = computed(() => $gettext('Click to switch theme'))
    const switchLabel = computed(() => $gettext('Currently used theme'))

    watch(currentThemeName, async () => {
      await store.dispatch('loadTheme', { theme: unref(currentTheme) })
      applyTheme(unref(currentTheme))
    })

    const isLightTheme = computed(() => [null, themeNameLight].includes(currentThemeName.value))

    const switchIcon = computed(() => (isLightTheme.value ? 'sun' : 'moon-clear'))

    const toggleTheme = () => {
      currentThemeName.value = isLightTheme.value ? themeNameDark : themeNameLight
    }

    return {
      buttonLabel,
      currentThemeName,
      currentTheme,
      switchIcon,
      switchLabel,
      toggleTheme
    }
  }
})
</script>
