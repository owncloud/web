<template>
  <video
    ref="video"
    :key="`media-video-${file.id}`"
    controls
    preload="preload"
    :autoplay="isAutoPlayEnabled"
    @loadedmetadata="updateDimensions"
  >
    <source :src="file.url" :type="file.mimeType" />
  </video>
</template>
<script lang="ts">
import { defineComponent, PropType } from 'vue'
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
  beforeUnmount() {
    window.removeEventListener('resize', this.resizeVideoDimensions)
  },
  methods: {
    updateDimensions() {
      this.resizeVideoDimensions()
      window.addEventListener('resize', this.resizeVideoDimensions)
    },
    resizeVideoDimensions() {
      const maxHeight = document.querySelector('.stage_media')?.offsetHeight - 10 ?? null
      const maxWidth = document.querySelector('.stage_media')?.offsetWidth - 10 ?? null
      if (maxHeight && maxWidth && this.$refs.video) {
        this.$refs.video.style.maxHeight = `${maxHeight}px`
        this.$refs.video.style.maxWidth = `${maxWidth}px`
      }
    }
  }
})
</script>
