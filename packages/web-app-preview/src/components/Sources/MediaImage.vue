<template>
  <img
    :key="`media-image-${file.id}`"
    :src="file.url"
    :alt="file.name"
    :data-id="file.id"
    :style="`zoom: ${currentImageZoom};transform: rotate(${currentImageRotation}deg); ${imageStyles}`"
  />
</template>
<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { CachedFile } from '../../helpers/types'
import { useImageStyles } from '../../composables'
import { useStore } from 'web-pkg/src'

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

    const styles = store.getters['Preview/allStyles']
    const imageStyles = useImageStyles(styles)
    return {
      imageStyles
    }
  }
})
</script>
