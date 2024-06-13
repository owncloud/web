<template>
  <div class="audio-container oc-flex oc-flex-column">
    <audio :key="`media-audio-${file.id}`" controls preload="preload" :autoplay="isAutoPlayEnabled">
      <source :src="file.url" :type="file.mimeType" />
    </audio>
    <p v-if="audioText" v-text="audioText"></p>
  </div>
</template>
<script lang="ts">
import { computed, defineComponent, PropType } from 'vue'
import { CachedFile } from '../../helpers/types'
import { Resource } from '@ownclouders/web-client'

export default defineComponent({
  name: 'MediaAudio',
  props: {
    file: {
      type: Object as PropType<CachedFile>,
      required: true
    },
    resource: {
      type: Object as PropType<Resource>,
      required: true
    },
    isAutoPlayEnabled: {
      type: Boolean,
      default: true
    }
  },
  setup(props) {
    const audioText = computed(() => {
      if (props.resource.audio?.artist && props.resource.audio?.title) {
        return `${props.resource.audio.artist} - ${props.resource.audio.title}`
      }
      return ''
    })

    return { audioText }
  }
})
</script>
<style lang="scss" scoped>
.audio-container {
  width: 300px;
}
</style>
