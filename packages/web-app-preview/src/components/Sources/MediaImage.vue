<template>
  <cropper
    v-if="isCropperActive"
    ref="cropper"
    class="cropper"
    :src="file.url"
    :stencil-component="CropperTools.cropperVariant"
    :resize-image="{ wheel: false }"
    @change="handleUpdateCropper"
  />
  <img
    v-else-if="isWriteActive || isDrawActive"
    :src="file.url"
    :alt="file.name"
    :data-id="file.id"
    :style="`zoom: ${currentImageZoom};transform: rotate(${currentImageRotation}deg); ${adjustmentParams}`"
  />
  <img
    v-else
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
import { Cropper, CircleStencil, RectangleStencil } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'
import { CropVariantEnum, ProcessingToolsEnum } from '../../helpers'
import { mapMutations } from 'vuex'

export default defineComponent({
  name: 'MediaImage',
  components: {
    Cropper
  },
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
    const isCropperActive = computed(() => {
      const selectedProcessingTool = store.getters['Preview/getSelectedProcessingTool']
      return selectedProcessingTool === ProcessingToolsEnum.Crop
    })

    const isWriteActive = computed(() => {
      const selectedProcessingTool = store.getters['Preview/getSelectedProcessingTool']
      return selectedProcessingTool === ProcessingToolsEnum.Write
    })

    const isDrawActive = computed(() => {
      const selectedProcessingTool = store.getters['Preview/getSelectedProcessingTool']
      return selectedProcessingTool === ProcessingToolsEnum.Draw
    })

    const CropperTools = computed(() => {
      const activeCropVariant = store.getters['Preview/getCropVariant']
      let Stencil

      switch (activeCropVariant) {
        case CropVariantEnum.Circular:
          Stencil = CircleStencil
          break

        default:
          Stencil = RectangleStencil
          break
      }

      return { cropperVariant: Stencil }
    })

    return {
      adjustmentParams,
      isCropperActive,
      isWriteActive,
      isDrawActive,
      CropperTools
    }
  },
  methods: {
    ...mapMutations('Preview', ['UPDATE_CROPPED_CANVAS']),
    handleUpdateCropper({ canvas }) {
      this.UPDATE_CROPPED_CANVAS(canvas)
    }
  }
})
</script>

<style lang="scss">
.cropper {
  overflow: hidden;
  max-width: calc(100vw - 20rem);
}
</style>
