<template>
  <div>
    <oc-select
      :model-value="currentTheme"
      :clearable="false"
      :options="availableThemes"
      option-label="name"
      @update:model-value="updateTheme"
    />
  </div>
</template>
<script lang="ts">
import { defineComponent, unref } from 'vue'
import { useMessages, useThemeStore, WebThemeType } from '@ownclouders/web-pkg'
import { storeToRefs } from 'pinia'
import { useGettext } from 'vue3-gettext'

export default defineComponent({
  setup() {
    const themeStore = useThemeStore()
    const { showMessage } = useMessages()
    const { $gettext } = useGettext()

    const { setAndApplyTheme } = themeStore

    const updateTheme = (newTheme: WebThemeType) => {
      setAndApplyTheme(newTheme)
      showMessage({ title: $gettext('Preference saved.') })
    }

    const { availableThemes, currentTheme } = storeToRefs(themeStore)

    const isThemeCurrentlyActive = (theme: WebThemeType) => {
      return unref(currentTheme) === theme
    }

    return {
      availableThemes,
      currentTheme,
      isThemeCurrentlyActive,
      updateTheme
    }
  }
})
</script>
