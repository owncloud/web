<template>
  <video :key="`media-video-${file.id}`" controls preload="preload" :autoplay="isAutoPlayEnabled">
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
  setup(props) {
    return {}
  }
})
</script>
