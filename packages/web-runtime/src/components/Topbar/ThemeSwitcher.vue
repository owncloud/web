<template>
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
  <template v-else-if="availableThemes.length > 2">
    <oc-button
      id="files-view-options-btn"
      key="files-view-options-btn"
      v-oc-tooltip="buttonLabel"
      data-testid="files-view-options-btn"
      :aria-label="buttonLabel"
      appearance="raw"
      variation="inverse"
      class="oc-mr-s"
    >
      <oc-icon name="paint" />
    </oc-button>
    <oc-drop
      drop-id="files-view-options-drop"
      toggle="#files-view-options-btn"
      mode="click"
      class="oc-width-auto"
      padding-size="medium"
    >
      <oc-list>
        <li
          v-for="theme in availableThemes"
          :key="theme.general.name"
          class="files-view-options-list-item"
        >
          <oc-button @click="setAndApplyTheme(theme)">{{ theme.general.name }}</oc-button>
        </li>
      </oc-list>
    </oc-drop>
  </template>
</template>
<script lang="ts">
import { computed, defineComponent } from 'vue'
import { useGettext } from 'vue3-gettext'
import { useThemeStore } from '@ownclouders/web-pkg'
import { storeToRefs } from 'pinia'

export default defineComponent({
  setup() {
    const { $gettext } = useGettext()
    const themeStore = useThemeStore()

    const { setAndApplyTheme, toggleTheme } = themeStore

    const { availableThemes, currentTheme, hasOnlyTwoThemesForLightDarkMode } =
      storeToRefs(themeStore)

    const buttonLabel = computed(() => $gettext('Click to switch theme'))
    const switchLabel = computed(() => $gettext('Currently used theme'))
    const switchIcon = computed(() => (currentTheme.value.isDark === false ? 'sun' : 'moon-clear'))

    return {
      availableThemes,
      buttonLabel,
      currentTheme,
      hasOnlyTwoThemesForLightDarkMode,
      setAndApplyTheme,
      switchIcon,
      switchLabel,
      toggleTheme
    }
  }
})
</script>
