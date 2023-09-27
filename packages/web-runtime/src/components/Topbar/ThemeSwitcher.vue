<template>
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
</template>
<script lang="ts">
import { computed, unref, watch, defineComponent } from 'vue'
import { mapGetters } from 'vuex'
import { useStore, useLocalStorage } from '@ownclouders/web-pkg'
import { themeNameDark, themeNameLight, useDefaultThemeName } from '../../composables'

export default defineComponent({
  setup() {
    const store = useStore()
    const currentThemeName = useLocalStorage('oc_currentThemeName', useDefaultThemeName())
    const currentTheme = computed(() => store.getters.configuration.themes[unref(currentThemeName)])
    const applyTheme = (theme) => {
      for (const param in theme.designTokens.colorPalette) {
        ;(document.querySelector(':root') as HTMLElement).style.setProperty(
          `--oc-color-${param}`,
          theme.designTokens.colorPalette[param]
        )
      }
    }

    watch(currentThemeName, async () => {
      await store.dispatch('loadTheme', { theme: unref(currentTheme) })
      applyTheme(unref(currentTheme))
    })

    return { currentThemeName, currentTheme }
  },
  computed: {
    ...mapGetters(['configuration']),
    isLightTheme() {
      return [null, themeNameLight].includes(this.currentThemeName)
    },
    buttonLabel() {
      return this.$gettext('Click to switch theme')
    },
    switchIcon() {
      return this.isLightTheme ? 'sun' : 'moon-clear'
    },
    switchLabel() {
      return this.$gettext('Currently used theme')
    }
  },
  methods: {
    toggleTheme() {
      this.currentThemeName = this.isLightTheme ? themeNameDark : themeNameLight
    }
  }
})
</script>
