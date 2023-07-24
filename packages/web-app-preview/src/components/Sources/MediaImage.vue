<template>
  <img
    :key="`media-image-${file.id}`"
    :src="file.url"
    :alt="file.name"
    :data-id="file.id"
    :style="`zoom: ${currentImageZoom};transform: rotate(${currentImageRotation}deg); ${styles}`"
  />
</template>
<script lang="ts">
import { computed, defineComponent, PropType } from 'vue'
import { CachedFile } from '../../helpers/types'
import { useCSSImageStyles } from '../../composables'
import { useStore } from 'web-pkg/src'
import { ComputedRef } from 'vue'

export default defineComponent({
  name: 'MediaImage',
  props: {
    file: {
      type: Object as PropType<CachedFile>,
      required: true
    },
    currentImageZoom: {
      type: Number,
      required: true
    },
    currentImageRotation: {
      type: Number,
      required: true
    }
  },
  setup() {
    const store = useStore()
    const styles: ComputedRef<string> = computed(() => {
      const imageStyles = store.getters['Preview/allStyles']
      return useCSSImageStyles(imageStyles)
    })

    return {
      styles
    }
  }
})
</script>
