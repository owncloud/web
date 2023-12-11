<template>
  <div v-if="!hasOnlyOneTheme">
    <oc-button
      v-if="hasOnlyTwoThemesForLightDarkMode"
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
    <template v-else>
      <oc-button
        id="theme-picker-options-btn"
        key="theme-picker-options-btn"
        v-oc-tooltip="buttonLabel"
        data-testid="theme-picker-options-btn"
        :aria-label="buttonLabel"
        appearance="raw-inverse"
        variation="brand"
      >
        <oc-icon name="palette" />
      </oc-button>
      <oc-drop
        drop-id="theme-picker-options-drop"
        toggle="#theme-picker-options-btn"
        mode="click"
        padding-size="small"
        close-on-click
      >
        <oc-list class="oc-tiles-sort-list">
          <li v-for="(theme, index) in availableThemes" :key="index" class="oc-my-xs">
            <oc-button
              :aria-label="buttonLabel"
              justify-content="space-between"
              class="theme-picker-options-list-item oc-p-s oc-width-1-1"
              :class="{
                'oc-background-primary-gradient': isThemeCurrentlyActive(theme),
                selected: isThemeCurrentlyActive(theme)
              }"
              :appearance="isThemeCurrentlyActive(theme) ? 'raw-inverse' : 'raw'"
              :variation="isThemeCurrentlyActive(theme) ? 'primary' : 'passive'"
              @click="setAndApplyTheme(theme)"
            >
              <span>{{ theme.name }}</span>
              <oc-icon v-if="isThemeCurrentlyActive(theme)" name="check" variation="inherit" />
            </oc-button>
          </li>
        </oc-list>
      </oc-drop>
    </template>
  </div>
</template>
<script lang="ts">
import { computed, defineComponent, unref } from 'vue'
import { useGettext } from 'vue3-gettext'
import { useThemeStore } from '@ownclouders/web-pkg'
import { storeToRefs } from 'pinia'

export default defineComponent({
  setup() {
    const { $gettext } = useGettext()
    const themeStore = useThemeStore()

    const { setAndApplyTheme, toggleTheme } = themeStore

    const { availableThemes, currentTheme, hasOnlyOneTheme, hasOnlyTwoThemesForLightDarkMode } =
      storeToRefs(themeStore)

    const buttonLabel = computed(() => $gettext('Click to switch theme'))
    const switchLabel = computed(() => $gettext('Currently used theme'))
    const switchIcon = computed(() => (currentTheme.value.isDark === false ? 'sun' : 'moon-clear'))

    const isThemeCurrentlyActive = (theme) => {
      return unref(currentTheme) === theme
    }

    return {
      availableThemes,
      buttonLabel,
      currentTheme,
      hasOnlyOneTheme,
      hasOnlyTwoThemesForLightDarkMode,
      isThemeCurrentlyActive,
      setAndApplyTheme,
      switchIcon,
      switchLabel,
      toggleTheme
    }
  }
})
</script>
