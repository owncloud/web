<template>
  <div>
    <oc-select
      :model-value="currentThemeOrAuto"
      :clearable="false"
      :options="availableThemesAndAuto"
      option-label="name"
      @update:model-value="updateTheme"
    />
  </div>
</template>
<script lang="ts">
import { computed, defineComponent, unref } from 'vue'
import { useMessages, useThemeStore, WebThemeType } from '@ownclouders/web-pkg'
import { storeToRefs } from 'pinia'
import { useGettext } from 'vue3-gettext'

export default defineComponent({
  setup() {
    const themeStore = useThemeStore()
    const { showMessage } = useMessages()
    const { $gettext } = useGettext()
    const autoTheme = { name: $gettext('Auto (same as system)') }

    const { setAndApplyTheme, setAutoSystemTheme, isCurrentThemeAutoSystem } = themeStore

    const updateTheme = (newTheme: WebThemeType) => {
      if (newTheme == autoTheme) {
        setAutoSystemTheme()
        return
      }
      setAndApplyTheme(newTheme)
      showMessage({ title: $gettext('Preference saved.') })
    }

    const { availableThemes, currentTheme } = storeToRefs(themeStore)
    const currentThemeOrAuto = computed(() => {
      if (unref(isCurrentThemeAutoSystem)) {
        return autoTheme
      }
      return unref(currentTheme)
    })
    const availableThemesAndAuto = [autoTheme, ...unref(availableThemes)]

    return {
      availableThemesAndAuto,
      currentThemeOrAuto,
      updateTheme
    }
  }
})
</script>
