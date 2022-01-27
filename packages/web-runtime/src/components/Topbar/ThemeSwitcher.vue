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
import { mapGetters, mapActions } from 'vuex'

export default {
  data() {
    return {
      mode: 'light'
    }
  },
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
  mounted() {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      this.changeTheme()
    }
  },
  methods: {
    ...mapActions(['loadTheme']),

    changeTheme() {
      if (this.mode === 'light') {
        this.loadTheme({ theme: this.configuration.themes['default-dark'] })
        this.applyChangedTheme()
        this.mode = 'dark'
      } else {
        this.loadTheme({ theme: this.configuration.themes.default })
        this.applyChangedTheme()
        this.mode = 'light'
      }
    },

    applyChangedTheme() {
      for (const param in this.configuration.currentTheme.designTokens.colorPalette) {
        document
          .querySelector(':root')
          .style.setProperty(
            '--oc-' + 'color-' + param,
            this.configuration.currentTheme.designTokens.colorPalette[param]
          )
      }
    }
  }
}
</script>
