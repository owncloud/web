<template>
  <div>
    <oc-select
      :placeholder="$gettext('Please choose...')"
      :model-value="currentTheme"
      :clearable="false"
      :options="availableThemes"
      option-label="name"
      @update:model-value="updateTheme"
    />
  </div>
</template>
<script lang="ts">
import { computed, defineComponent, unref } from 'vue'
import { useGettext } from 'vue3-gettext'
import { useThemeStore } from '@ownclouders/web-pkg'
import { storeToRefs } from 'pinia'

export default defineComponent({
  emits: ['update'],
  setup(props, { emit }) {
    const { $gettext } = useGettext()
    const themeStore = useThemeStore()

    const { setAndApplyTheme } = themeStore

    const updateTheme = (newTheme) => {
      setAndApplyTheme(newTheme)
      emit('update')
    }

    const { availableThemes, currentTheme } = storeToRefs(themeStore)

    const buttonLabel = computed(() => $gettext('Click to switch theme'))

    const isThemeCurrentlyActive = (theme) => {
      return unref(currentTheme) === theme
    }

    return {
      availableThemes,
      buttonLabel,
      currentTheme,
      isThemeCurrentlyActive,
      updateTheme
    }
  }
})
</script>
