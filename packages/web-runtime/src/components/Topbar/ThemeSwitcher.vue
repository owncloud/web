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
      id="my_filter"
      class="oc-mr-s"
      appearance="raw"
      variation="inverse"
      :aria-label="buttonLabel"
    >
      <oc-icon name="paint" accessible-label="Select theme" class="oc-pr-xs" />
    </oc-button>

    <oc-drop drop-id="oc-drop" toggle="#my_filter" mode="click" close-on-click>
      <div slot="special" class="oc-card">
        <div class="oc-card-header">
          <h3 v-translate class="oc-card-title">Themes</h3>
        </div>
        <div class="oc-card-body theme-switcher-list">
          <oc-list>
            <li v-for="(themeName, themeId) in themeOptions" :key="themeId">
              <oc-button
                class="oc-p-s"
                @click="selectTheme(themeId)"
                :class="{
                  'oc-background-primary-gradient': isSelectedTheme(themeId),
                  selected: isSelectedTheme(themeId)
                }"
                :appearance="isSelectedTheme(themeId) ? 'raw-inverse' : 'raw'"
                :variation="isSelectedTheme(themeId) ? 'primary' : 'passive'"
              >
                <span
                  class="oc-text-bold oc-display-block oc-width-1-1"
                  v-text="$gettext(themeName)"
                />
              </oc-button>
            </li>
          </oc-list>
        </div>
      </div>
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

<style lang="scss">
.theme-switcher-list {
  .oc-card {
    padding-left: 0px !important;
    padding-right: 0px !important;
  }
  text-align: left;
  white-space: normal;

  a,
  button,
  span {
    display: inline-flex;
    font-weight: normal !important;
    gap: 10px;
    justify-content: flex-start;
    vertical-align: top;
    width: 100%;
    text-align: left;
  }
}
</style>
