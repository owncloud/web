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
      const stageMedia: HTMLElement = document.querySelector('.stage_media')
      video.value.style.maxHeight = `${stageMedia.offsetHeight - 10}px`
      video.value.style.maxWidth = `${stageMedia.offsetWidth - 10}px`
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
