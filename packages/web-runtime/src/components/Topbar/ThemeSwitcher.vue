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
import { useThemeStore, WebThemeType } from '@ownclouders/web-pkg'
import { storeToRefs } from 'pinia'

export default defineComponent({
  emits: ['update'],
  setup(props, { emit }) {
    const themeStore = useThemeStore()

    const { setAndApplyTheme } = themeStore

    const updateTheme = (newTheme: WebThemeType) => {
      setAndApplyTheme(newTheme)
      emit('update')
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
