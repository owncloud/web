<template>
  <div class="sidebar-tools">
    <div :aria-label="$gettext('Editing tools')" class="tool-list">
      <oc-button
        :aria-label="$gettext('Customize image')"
        class="media-settings-button"
        appearance="raw"
        :style="
          selectedProcessingTool === ProcessingToolsEnum.Customize &&
          'border-left: 2px solid var(--oc-color-icon-root); background-color: var(--oc-color-background-highlight)'
        "
        @click="$emit('change-processing-tool', ProcessingToolsEnum.Customize)"
      >
        <oc-icon name="tools" />
        <span>{{ $gettext('Customize') }}</span>
      </oc-button>

      <oc-button
        :aria-label="$gettext('Crop image')"
        class="media-settings-button"
        appearance="raw"
        :style="
          selectedProcessingTool === ProcessingToolsEnum.Crop &&
          'border-left: 2px solid var(--oc-color-icon-root); background-color: var(--oc-color-background-highlight)'
        "
        @click="$emit('change-processing-tool', ProcessingToolsEnum.Crop)"
      >
        <oc-icon name="crop" fill-type="line" />
        <span>{{ $gettext('Crop') }}</span>
      </oc-button>
      <!-- TBI -->
      <oc-button
        :aria-label="$gettext('Rotate image button')"
        class="media-settings-button"
        appearance="raw"
        :style="
          selectedProcessingTool === ProcessingToolsEnum.Rotate &&
          'border-left: 2px solid var(--oc-color-icon-root); background-color: var(--oc-color-background-highlight)'
        "
        @click="$emit('change-processing-tool', ProcessingToolsEnum.Rotate)"
      >
        <oc-icon name="anticlockwise" fill-type="line" />
        <span>{{ $gettext('Rotate') }}</span>
      </oc-button>

      <!-- <oc-button
        class="media-settings-button"
        appearance="raw"
        :style="
          selectedProcessingTool === ProcessingToolsEnum.Write &&
          'border-left: 2px solid var(--oc-color-icon-root); background-color: var(--oc-color-background-highlight)'
        "
        @click="$emit('change-processing-tool', ProcessingToolsEnum.Write)"
      >
        <oc-icon name="pencil" />
        <span>{{ $gettext('Write') }}</span>
      </oc-button> -->

      <!--
      <oc-button
        class="media-settings-button"
        appearance="raw"
        :style="
          selectedProcessingTool === ProcessingToolsEnum.Draw &&
          'border-left: 2px solid var(--oc-color-icon-root); background-color: var(--oc-color-background-highlight)'
        "
        @click="$emit('change-processing-tool', ProcessingToolsEnum.Draw)"
      >
        <oc-icon name="brush" />
        <span>{{ $gettext('Draw') }}</span>
      </oc-button> -->
    </div>
    <div :aria-label="$gettext('Customize tool')" class="side-bar-animation">
      <div v-if="selectedProcessingTool === ProcessingToolsEnum.Customize" class="options-bar">
        <adjustment-parameters-category
          name="General"
          icon-name="equalizer"
          :parameter-category="AdjustmentParametersCategoryEnum.General"
          :is-open-default="true"
        />
        <adjustment-parameters-category
          name="Fine Tune"
          icon-name="contrast-drop-2"
          is-fill-type-line
          :parameter-category="AdjustmentParametersCategoryEnum.FineTune"
        />
        <adjustment-parameters-category
          name="Miscellaneous"
          icon-name="command"
          :parameter-category="AdjustmentParametersCategoryEnum.Miscellaneous"
        />
      </div>
      <div
        v-else-if="selectedProcessingTool === ProcessingToolsEnum.Rotate"
        :aria-label="$gettext('Rotate tool')"
        class="options-bar-compact"
      >
        <div class="cropper-options">
          <oc-button
            :aria-label="$gettext('Rotate counterclockwise 90°')"
            appearance="raw"
            :class="'crop-variant'"
            @click="$emit('rotateImage', -90)"
          >
            <oc-icon name="anticlockwise" fill-type="line" />
            <span>{{ $gettext('-90°') }}</span>
          </oc-button>
          <oc-button
            :aria-label="$gettext('Rotate clockwise 90°')"
            appearance="raw"
            :class="'crop-variant'"
            @click="$emit('rotateImage', 90)"
          >
            <oc-icon name="clockwise" fill-type="line" />
            <span>{{ $gettext('90°') }}</span>
          </oc-button>
        </div>
      </div>
      <div
        v-else-if="selectedProcessingTool === ProcessingToolsEnum.Crop"
        :aria-label="$gettext('Crop tool')"
        class="options-bar-compact"
      >
        <div class="cropper-options">
          <oc-button
            :class="
              cropVariant === CropVariantEnum.FreeForm ? 'crop-variant-active' : 'crop-variant'
            "
            :aria-label="$gettext('Crop type rectangle')"
            appearance="raw"
            @click="handleUpdateCropVariant(CropVariantEnum.FreeForm)"
          >
            <oc-icon name="crop" fill-type="line" />
            <span>{{ $gettext('Free form') }}</span>
          </oc-button>
          <oc-button
            :class="
              cropVariant === CropVariantEnum.Circular ? 'crop-variant-active' : 'crop-variant'
            "
            :aria-label="$gettext('Crop type circle')"
            appearance="raw"
            @click="handleUpdateCropVariant(CropVariantEnum.Circular)"
          >
            <oc-icon name="checkbox-blank-circle" fill-type="line" />
            <span>{{ $gettext('Circular') }}</span>
          </oc-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { AdjustmentParametersCategoryEnum, ProcessingToolsEnum } from '../helpers'
import { CropVariantEnum } from '../helpers/enums'
import AdjustmentParametersCategory from './StylebarComponents/AdjustmentParametersCategory.vue'
import { useStore } from 'web-pkg/src'
import { mapMutations } from 'vuex'
import { computed } from 'vue'
import { useGettext } from 'vue3-gettext'

export default defineComponent({
  components: { AdjustmentParametersCategory },
  emits: ['download', 'saveCroppedImage', 'change-processing-tool', 'rotateImage'],
  setup() {
    const store = useStore()
    const selectedProcessingTool = computed(
      () => store.getters['Preview/getSelectedProcessingTool']
    )
    const cropVariant = computed(() => store.getters['Preview/getCropVariant'])

    const { $gettext } = useGettext()

    return {
      selectedProcessingTool,
      cropVariant,
      CropVariantEnum,
      $gettext
    }
  },
  data() {
    return {
      AdjustmentParametersCategoryEnum: AdjustmentParametersCategoryEnum,
      ProcessingToolsEnum: ProcessingToolsEnum
    }
  },
  methods: {
    ...mapMutations('Preview', ['SET_CROP_VARIANT']),
    handleUpdateCropVariant(newCropVariant: CropVariantEnum) {
      if (newCropVariant !== this.cropVariant) {
        this.SET_CROP_VARIANT(newCropVariant)
      }
    }
  }
})
</script>

<style lang="scss" scoped>
.sidebar-tools {
  height: 100vh;
  box-shadow: 0px 0 25px rgba(0, 0, 0, 0.3);
  display: flex;
}

.tool-list {
  list-style-type: none;
  padding: 0;
  height: 100vh;
  width: 6rem;
}

.media-settings-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: var(--oc-font-size-small);
  width: 100%;
  height: 5rem;
  border-radius: 0;
  padding: $oc-space-small;
  box-sizing: border-box;

  &:hover {
    background-color: var(--oc-color-background-highlight);
  }
}

.download-button {
  margin-top: $oc-space-small;
}

.options-bar {
  width: 18rem;
  box-sizing: border-box;
  padding: $oc-space-small;
  height: 90vh;
  overflow-y: auto;
  &::-webkit-scrollbar {
    display: none;
  }
  scrollbar-width: none;
}

.options-bar-compact {
  width: 6rem;
  box-sizing: border-box;
  height: 100%;
  padding-bottom: 20rem;
  overflow-y: auto;
}

.cropper-options {
  flex-grow: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 32px;
}

.crop-variant-active {
  background-color: var(--oc-color-background-highlight);
  box-sizing: border-box;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 0px;
  height: 5rem;
  width: 100%;

  &:hover {
    background-color: var(--oc-color-background-highlight);
  }

  &:focus {
    background-color: var(--oc-color-background-highlight);
  }
  &:active {
    background-color: var(--oc-color-background-highlight);
  }
}

.crop-variant {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 0px;
  height: 5rem;
  width: 100%;

  &:hover {
    background-color: var(--oc-color-background-highlight);
  }
}

.crop-image-button {
  display: flex;
  justify-content: center;
}

.side-bar-animation {
  flex-grow: 1;
  overflow-y: auto;
}
</style>
