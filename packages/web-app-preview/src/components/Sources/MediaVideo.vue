<template>
  <video
    ref="video"
    :key="`media-video-${file.id}`"
    controls
    preload="preload"
    :autoplay="isAutoPlayEnabled"
  >
    <source :src="file.url" :type="file.mimeType" />
  </video>
</template>
<script lang="ts">
import { defineComponent, onBeforeUnmount, onMounted, PropType, ref } from 'vue'
import { CachedFile } from '../../helpers/types'

export default defineComponent({
  name: 'MediaVideo',
  props: {
    file: {
      type: Object as PropType<CachedFile>,
      required: true
    },
    isAutoPlayEnabled: {
      type: Boolean,
      default: true
    }
  },
  setup() {
    const video = ref(null)
    const resizeVideoDimensions = () => {
      const maxHeight = document.querySelector('.stage_media')?.offsetHeight - 10 ?? null
      const maxWidth = document.querySelector('.stage_media')?.offsetWidth - 10 ?? null
      if (maxHeight && maxWidth && video.value) {
        video.value.style.maxHeight = `${maxHeight}px`
        video.value.style.maxWidth = `${maxWidth}px`
      }
    }

    onMounted(() => {
      resizeVideoDimensions()
      window.addEventListener('resize', resizeVideoDimensions)
    })

    onBeforeUnmount(() => {
      window.removeEventListener('resize', resizeVideoDimensions)
    })

    return {
      video
    }
  }
})
</script>
