<template>
  <audio :key="`media-audio-${file.id}`" controls preload="preload" :autoplay="isAutoPlayEnabled">
    <source :src="file.url" :type="file.mimeType" />
  </audio>
</template>
<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { CachedFile } from '../../helpers/types'

export default defineComponent({
  name: 'MediaAudio',
  props: {
    file: {
      type: Object as PropType<CachedFile>,
      required: true
    },
    isAutoPlayEnabled: {
      type: Boolean,
      default: true
    }
  }
})
</script>
