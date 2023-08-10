<template>
  <cropper
    v-if="selectedProcessingTool === ProcessingToolsEnum.Crop"
    ref="cropper"
    :aria-label="$gettext('Cropper')"
    class="cropper"
    :src="file.url"
    :stencil-component="CropperTools.cropperVariant"
    :resize-image="{ wheel: false }"
    @change="handleUpdateCropper"
  />
  <img
    v-else
    :aria-label="$gettext('Displayed image')"
    class="image"
    :src="file.url"
    :alt="file.url === '' ? `${file.name} \n The file is to large to render` : file.name"
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
import { unref } from 'vue'

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
    const imageAdjustmentParams = computed(() => store.getters['Preview/allParameters'])

    const adjustmentParams: ComputedRef<string> = computed(() =>
      useCSSImageAdjustmentParameters(unref(imageAdjustmentParams))
    )

    const selectedProcessingTool = computed<ProcessingToolsEnum>(
      () => store.getters['Preview/getSelectedProcessingTool']
    )

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
      selectedProcessingTool,
      CropperTools,
      ProcessingToolsEnum
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
