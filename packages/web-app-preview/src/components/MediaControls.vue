<template>
  <div class="preview-details" :class="{ lightbox: isFullScreenModeActivated }">
    <div
      class="oc-background-brand oc-p-s oc-width-large oc-flex oc-flex-middle oc-flex-center oc-flex-around preview-controls-action-bar"
    >
      <oc-button
        v-oc-tooltip="previousDescription"
        class="preview-controls-previous"
        appearance="raw-inverse"
        variation="brand"
        :aria-label="previousDescription"
        @click="$emit('togglePrevious')"
      >
        <oc-icon size="large" name="arrow-drop-left" variation="inherit" />
      </oc-button>
      <p v-if="!isFolderLoading" class="oc-m-rm preview-controls-action-count">
        <span aria-hidden="true" v-text="ariaHiddenFileCount" />
        <span class="oc-invisible-sr" v-text="screenreaderFileCount" />
      </p>
      <oc-button
        v-oc-tooltip="nextDescription"
        class="preview-controls-next"
        appearance="raw-inverse"
        variation="brand"
        :aria-label="nextDescription"
        @click="$emit('toggleNext')"
      >
        <oc-icon size="large" name="arrow-drop-right" variation="inherit" />
      </oc-button>
      <div class="oc-flex">
        <oc-button
          v-oc-tooltip="
            isFullScreenModeActivated ? exitFullScreenDescription : enterFullScreenDescription
          "
          class="preview-controls-fullscreen"
          appearance="raw-inverse"
          variation="brand"
          :aria-label="
            isFullScreenModeActivated ? exitFullScreenDescription : enterFullScreenDescription
          "
          @click="$emit('toggleFullScreen')"
        >
          <oc-icon
            fill-type="line"
            :name="isFullScreenModeActivated ? 'fullscreen-exit' : 'fullscreen'"
            variation="inherit"
          />
        </oc-button>
      </div>
      <div v-if="showImageControls" class="oc-flex oc-flex-middle">
        <div class="oc-flex">
          <oc-button
            v-oc-tooltip="imageShrinkDescription"
            class="preview-controls-image-shrink"
            appearance="raw-inverse"
            variation="brand"
            :aria-label="imageShrinkDescription"
            @click="imageShrink"
          >
            <oc-icon fill-type="line" name="zoom-out" variation="inherit" />
          </oc-button>
          <oc-button
            v-oc-tooltip="imageOriginalSizeDescription"
            class="preview-controls-image-original-size oc-ml-s oc-mr-s"
            appearance="raw-inverse"
            variation="brand"
            :aria-label="imageOriginalSizeDescription"
            @click="$emit('setZoom', 1)"
          >
            <span v-text="currentZoomDisplayValue" />
          </oc-button>
          <oc-button
            v-oc-tooltip="imageZoomDescription"
            class="preview-controls-image-zoom"
            appearance="raw-inverse"
            variation="brand"
            :aria-label="imageZoomDescription"
            @click="imageZoom"
          >
            <oc-icon fill-type="line" name="zoom-in" variation="inherit" />
          </oc-button>
        </div>
        <div class="oc-ml-m">
          <oc-button
            v-oc-tooltip="imageRotateLeftDescription"
            class="preview-controls-rotate-left"
            appearance="raw-inverse"
            variation="brand"
            :aria-label="imageRotateLeftDescription"
            @click="imageRotateLeft"
          >
            <oc-icon fill-type="line" name="anticlockwise" variation="inherit" />
          </oc-button>
          <oc-button
            v-oc-tooltip="imageRotateRightDescription"
            class="preview-controls-rotate-right"
            appearance="raw-inverse"
            variation="brand"
            :aria-label="imageRotateRightDescription"
            @click="imageRotateRight"
          >
            <oc-icon fill-type="line" name="clockwise" variation="inherit" />
          </oc-button>
        </div>
        <div class="oc-ml-m">
          <oc-button
            v-oc-tooltip="imageResetDescription"
            class="preview-controls-image-reset"
            appearance="raw-inverse"
            variation="brand"
            :aria-label="imageResetDescription"
            @click="$emit('resetImage')"
          >
            <oc-icon fill-type="line" name="refresh" variation="inherit" />
          </oc-button>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { computed, defineComponent, PropType } from 'vue'
import { useGettext } from 'vue3-gettext'
import { Resource } from '@ownclouders/web-client'

export default defineComponent({
  name: 'MediaControls',
  props: {
    files: {
      type: Array as PropType<Resource[]>,
      required: true
    },
    activeIndex: {
      type: Number,
      required: true
    },
    isFullScreenModeActivated: {
      type: Boolean,
      default: false
    },
    isFolderLoading: {
      type: Boolean,
      default: false
    },
    showImageControls: {
      type: Boolean,
      default: false
    },
    currentImageZoom: {
      type: Number,
      default: 1
    },
    currentImageRotation: {
      type: Number,
      default: 0
    }
  },
  emits: [
    'setRotation',
    'setZoom',
    'toggleFullScreen',
    'toggleNext',
    'togglePrevious',
    'resetImage'
  ],
  setup(props, { emit }) {
    const { $gettext } = useGettext()

    const currentZoomDisplayValue = computed(() => {
      return `${(props.currentImageZoom * 100).toFixed(0)}%`
    })

    const ariaHiddenFileCount = computed(() => {
      return $gettext('%{ displayIndex } of %{ availableMediaFiles }', {
        displayIndex: (props.activeIndex + 1).toString(),
        availableMediaFiles: props.files.length.toString()
      })
    })
    const screenreaderFileCount = computed(() => {
      return $gettext('Media file %{ displayIndex } of %{ availableMediaFiles }', {
        displayIndex: (props.activeIndex + 1).toString(),
        availableMediaFiles: props.files.length.toString()
      })
    })

    const calculateZoom = (zoom: number, factor: number) => {
      return Math.round(zoom * factor * 20) / 20
    }
    const imageShrink = () => {
      emit('setZoom', Math.max(0.1, calculateZoom(props.currentImageZoom, 0.8)))
    }
    const imageZoom = () => {
      const maxZoomValue = calculateZoom(9, 1.25)
      emit('setZoom', Math.min(calculateZoom(props.currentImageZoom, 1.25), maxZoomValue))
    }
    const imageRotateLeft = () => {
      emit('setRotation', props.currentImageRotation === -270 ? 0 : props.currentImageRotation - 90)
    }
    const imageRotateRight = () => {
      emit('setRotation', props.currentImageRotation === 270 ? 0 : props.currentImageRotation + 90)
    }

    return {
      currentZoomDisplayValue,
      screenreaderFileCount,
      ariaHiddenFileCount,
      enterFullScreenDescription: $gettext('Enter full screen mode'),
      exitFullScreenDescription: $gettext('Exit full screen mode'),
      imageShrinkDescription: $gettext('Shrink the image'),
      imageZoomDescription: $gettext('Enlarge the image'),
      imageResetDescription: $gettext('Reset'),
      imageOriginalSizeDescription: $gettext('Show the image at its normal size'),
      imageRotateLeftDescription: $gettext('Rotate the image 90 degrees to the left'),
      imageRotateRightDescription: $gettext('Rotate the image 90 degrees to the right'),
      previousDescription: $gettext('Show previous media file in folder'),
      nextDescription: $gettext('Show next media file in folder'),
      imageShrink,
      imageZoom,
      imageRotateLeft,
      imageRotateRight
    }
  }
})
</script>

<style lang="scss" scoped>
.preview-details.lightbox {
  z-index: 1000;
  opacity: 0.9;
}

.preview-controls-action-count {
  color: var(--oc-color-swatch-brand-contrast);
}

.preview-controls-image-original-size {
  width: 42px;
}
</style>
