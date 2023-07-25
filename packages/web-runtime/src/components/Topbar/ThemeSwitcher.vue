<template>
  <oc-button
    v-if="!moreThemes"
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
  <div v-else class="oc-flex oc-flex-middle">
    <oc-button
      id="theme-switcher-button"
      class="oc-mr-s"
      appearance="raw"
      variation="inverse"
      :aria-label="buttonLabel"
    >
      <oc-icon name="paint" accessible-label="Select theme" class="oc-pr-xs" />
    </oc-button>

    <oc-drop
      drop-id="oc-drop"
      toggle="#theme-switcher-button"
      mode="click"
      padding-size="small"
      class="themes-drop"
      close-on-click
    >
      <h3 v-translate class="oc-pl-xs">Themes</h3>

      <oc-list class="themes-drop-list" :aria-label="themesListAriaLabel">
        <li v-for="(themeName, themeId) in themeOptions" :key="themeId">
          <oc-button
            :id="`themes-drop-btn-${themeId}`"
            appearance="raw"
            justify-content="space-between"
            class="themes-drop-btn oc-p-s"
            :class="{
              'oc-background-primary-gradient': isSelectedTheme(themeId),
              selected: isSelectedTheme(themeId)
            }"
            :variation="isSelectedTheme(themeId) ? 'inverse' : 'passive'"
            @click="selectTheme(themeId)"
          >
            <span class="oc-flex oc-flex-middle" v-text="$gettext(themeName)" />
          </oc-button>
        </li>
      </oc-list>
    </oc-drop>
  </div>
</template>
<script lang="ts">
import { computed, unref, watch, defineComponent } from 'vue'
import { mapGetters } from 'vuex'
import { useStore, useLocalStorage } from 'web-pkg/src/composables'
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

    return { currentThemeName, currentTheme, store }
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
    moreThemes() {
      return Object.keys(this.store.getters.configuration.themes).length > 2
    },
    themeOptions() {
      return Object.entries(this.store.getters.configuration.themes).reduce(
        (mapping, [key, value]) => {
          mapping[key] = value['theme-name']
          return mapping
        },
        {}
      )
    },
    themesListAriaLabel() {
      return this.$gettext('Select theme for the interface')
    }
  },
  methods: {
    toggleTheme() {
      this.currentThemeName = this.isLightTheme ? themeNameDark : themeNameLight
    },
    selectTheme(themeOption) {
      this.currentThemeName = themeOption
    },
    isSelectedTheme(themeOption) {
      return this.currentThemeName === themeOption
    }
  }
})
</script>

<style lang="scss" scoped>
.themes {
  &-drop {
    &-list {
      &:hover .themes-drop-btn.selected:not(:hover),
      &:focus .themes-drop-btn.selected:not(:focus) {
        color: var(--oc-color-swatch-passive-default);
      }

      li {
        margin: var(--oc-space-xsmall) 0;
      }
    }

    &-btn {
      width: 100%;
      gap: var(--oc-space-medium);

      &:hover,
      &:focus {
        background-color: var(--oc-color-background-hover) !important;
        color: var(--oc-color-swatch-passive-default);
        text-decoration: none;
      }

      &.selected {
        color: var(--oc-color-swatch-inverse-default) !important;
      }
    }
  }
}
</style>
