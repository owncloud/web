<template>
  <oc-button
    v-oc-tooltip="buttonLabel"
    class="themeswitcher-btn"
    :aria-label="buttonLabel"
    appearance="raw"
    variation="inverse"
    @click="changeTheme"
  >
    <span class="oc-visible@s" :aria-label="switchLabel" v-text="switchText" />
    <oc-icon :name="switchIcon" fill-type="line" />
  </oc-button>
</template>
<script>
import { unref, watch } from '@vue/composition-api'
import { mapGetters } from 'vuex'
import { useStore, useLocalStorage } from 'web-pkg/src/composables'

export default {
  computed: {
    ...mapGetters(['configuration']),
    buttonLabel() {
      return this.$gettext('Click to switch theme')
    },
    switchIcon() {
      return this.mode === 'light' ? 'sun' : 'moon-clear'
    },
    switchLabel() {
      return this.$gettext('Currently used theme')
    },
    switchText() {
      return this.mode === 'light' ? this.$gettext('Light mode') : this.$gettext('Dark mode')
    }
  },
  setup() {
    const store = useStore()
    const mode = useLocalStorage('oc_colorMode', null)
    const currentTheme = useLocalStorage(
      'oc_currentTheme',
      store.getters.configuration.currentTheme
    )

    watch(
      currentTheme,
      () => {
        store.dispatch('loadTheme', { theme: unref(currentTheme) })
      },
      { immediate: true }
    )

    return { currentTheme, mode }
  },
  mounted() {
    if (this.mode === null) {
      this.mode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      const themeToLoad = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'default-dark'
        : 'default'
      this.applyTheme(themeToLoad, this.mode)
    }
  },
  methods: {
    changeTheme() {
      if (this.mode === 'light' || this.mode === null) {
        this.applyTheme('default-dark', 'dark')
      } else {
        this.applyTheme('default', 'light')
      }
    },

    applyTheme(themeName, themeMode) {
      this.currentTheme = this.configuration.themes[themeName]
      this.mode = themeMode
      this.applyChangedTheme()
    },

    applyChangedTheme() {
      for (const param in this.currentTheme.designTokens.colorPalette) {
        document
          .querySelector(':root')
          .style.setProperty(
            '--oc-' + 'color-' + param,
            this.currentTheme.designTokens.colorPalette[param]
          )
      }
    }
  }
}
</script>
