<template>
  <oc-emoji-picker :theme="theme" @emoji-select="onEmojiSelect" />
</template>

<script lang="ts">
import { computed, defineComponent, PropType, unref } from 'vue'
import { Modal, useThemeStore } from '../../composables'
import { storeToRefs } from 'pinia'

export default defineComponent({
  name: 'EmojiPickerModal',
  components: {},
  props: {
    modal: { type: Object as PropType<Modal>, required: true }
  },
  emits: ['confirm'],
  setup(props, { emit }) {
    const themeStore = useThemeStore()
    const { currentTheme } = storeToRefs(themeStore)

    const theme = computed(() => {
      return unref(currentTheme).isDark ? 'dark' : 'light'
    })

    const onEmojiSelect = (emoji: string) => {
      emit('confirm', emoji)
    }

    return {
      onEmojiSelect,
      theme
    }
  }
})
</script>
