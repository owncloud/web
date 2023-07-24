<template>
  <img
    :key="`media-image-${file.id}`"
    :src="file.url"
    :alt="file.name"
    :data-id="file.id"
    :style="`zoom: ${currentImageZoom};transform: rotate(${currentImageRotation}deg); ${adjustmentParams}`"
  />
</template>
<script lang="ts">
import { computed, defineComponent, PropType } from 'vue'
import { CachedFile } from '../../helpers/types'
import { useCSSImageAdjustmentParameters } from '../../composables'
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
    const adjustmentParams: ComputedRef<string> = computed(() => {
      const imageAdjustmentParams = store.getters['Preview/allParameters']
      return useCSSImageAdjustmentParameters(imageAdjustmentParams)
    })

    return {
      adjustmentParams
    }
  }
})
</script>
