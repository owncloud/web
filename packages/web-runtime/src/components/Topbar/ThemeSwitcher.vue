<template>
  <oc-button
    v-oc-tooltip="buttonLabel"
    class="themeswitcher-btn"
    :aria-label="buttonLabel"
    appearance="raw"
    variation="inverse"
    style="white-space: nowrap"
    @click="toggleTheme"
  >
    <span class="oc-visible@s" :aria-label="switchLabel" v-text="switchText" />
    <oc-icon :name="switchIcon" fill-type="line" />
  </oc-button>
</template>
<script>
import { computed, unref, watch } from '@vue/composition-api'
import { mapGetters } from 'vuex'
import { useStore, useLocalStorage } from 'web-pkg/src/composables'
import { themeNameDark, themeNameLight, useDefaultThemeName } from '../../composables'

export default {
  setup() {
    const store = useStore()
    const currentThemeName = useLocalStorage('oc_currentThemeName', useDefaultThemeName())
    const currentTheme = computed(() => store.getters.configuration.themes[unref(currentThemeName)])
    const applyTheme = (theme) => {
      for (const param in theme.designTokens.colorPalette) {
        document
          .querySelector(':root')
          .style.setProperty(`--oc-color-${param}`, theme.designTokens.colorPalette[param])
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
    },
    switchText() {
      return this.isLightTheme ? this.$gettext('Light mode') : this.$gettext('Dark mode')
    }
  },
  methods: {
    toggleTheme() {
      this.currentThemeName = this.isLightTheme ? themeNameDark : themeNameLight
    }
  }
}
</script>
