<template>
  <div class="oc-position-medium oc-position-bottom-center preview-details">
    <div
      class="oc-background-brand oc-p-s oc-width-xlarge oc-flex oc-flex-middle oc-flex-center oc-flex-around preview-controls-action-bar"
    >
      <!-- prev / next -->
      <div class="oc-flex oc-flex-middle">
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
      </div>

      <!-- zoom -->
      <div class="oc-flex-middle">
        <div class="oc-flex">
          <oc-button
            v-oc-tooltip="imageShrinkDescription"
            class="preview-controls-image-shrink"
            appearance="raw-inverse"
            variation="brand"
            :aria-label="imageShrinkDescription"
            @click="imageShrink"
          >
            <oc-icon fill-type="line" name="checkbox-indeterminate" variation="inherit" />
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
            <oc-icon fill-type="line" name="add-box" variation="inherit" />
          </oc-button>
        </div>
      </div>

      <!-- rotation -->
      <div class="oc-flex oc-flex-middle">
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

      <!-- flip -->
      <div class="oc-flex oc-flex-middle">
        <oc-button
          v-oc-tooltip="imageFlipHorizontalDescription"
          class="preview-controls-flip-horizontal"
          appearance="raw-inverse"
          variation="brand"
          :aria-label="imageFlipHorizontalDescription"
          @click="$emit('setHorizontalFlip')"
        >
          <!-- TODO: insert correct icon -->
          <oc-icon fill-type="line" name="fullscreen" variation="inherit" />
        </oc-button>
        <oc-button
          v-oc-tooltip="imageFlipVerticalDescription"
          class="preview-controls-flip-vertical"
          appearance="raw-inverse"
          variation="brand"
          :aria-label="imageFlipVerticalDescription"
          @click="$emit('setVerticalFlip')"
        >
          <!-- TODO: insert correct icon -->
          <oc-icon fill-type="line" name="fullscreen" variation="inherit" />
        </oc-button>
      </div>

      <!-- invert -->
      <div class="oc-flex oc-flex-middle">
        <oc-button
          v-oc-tooltip="imageInvertDescription"
          class="preview-controls-invert"
          appearance="raw-inverse"
          variation="brand"
          :aria-label="imageInvertDescription"
          @click="$emit('toggleInversion')"
        >
          <!-- TODO: insert correct icon -->
          <oc-icon fill-type="line" name="fullscreen" variation="inherit" />
        </oc-button>
      </div>

      <!-- reset -->
      <div class="oc-flex oc-flex-middle">
        <oc-button
          v-oc-tooltip="imageResetDescription"
          class="preview-controls-reset"
          appearance="raw-inverse"
          variation="brand"
          :aria-label="imageResetDescription"
          @click="$emit('resetViewport')"
        >
          <!-- TODO: insert correct icon -->
          <oc-icon fill-type="line" name="fullscreen" variation="inherit" />
        </oc-button>
      </div>

      <!-- metadata -->
      <div class="oc-flex-middle oc-flex oc-mr-m">
        <oc-button
          v-oc-tooltip="
            isShowMetadataActivated ? imageHideMetadataDescription : imageShowMetadataDescription
          "
          class="preview-controls-show-metadata"
          appearance="raw-inverse"
          variation="brand"
          :aria-label="
            isShowMetadataActivated ? imageHideMetadataDescription : imageShowMetadataDescription
          "
          @click="$emit('toggleShowMetadata')"
        >
          <!-- TODO: insert correct icon, check if fill or line version is needed -->
          <oc-icon
            v-fill-type="isShowMetadataActivated ? 'fill' : 'line'"
            :name="isShowMetadataActivated ? 'side-bar-right' : 'side-bar-right'"
            variation="inherit"
          />
        </oc-button>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { computed, defineComponent, PropType } from 'vue'
import { useGettext } from 'vue3-gettext'
import { Resource } from 'web-client/src'

export default defineComponent({
  name: 'DicomControls',
  props: {
    files: {
      type: Array as PropType<Resource[]>,
      required: true
    },
    activeIndex: {
      type: Number,
      required: true
    },
    isFolderLoading: {
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
    },
    isShowMetadataActivated: {
      type: Boolean,
      default: false
    }
  },
  emits: [
    'setZoom',
    'setRotation',
    'setHorizontalFlip',
    'setVerticalFlip',
    'toggleInversion',
    'resetViewport',
    'toggleShowMetadata',
    'toggleNext',
    'togglePrevious'
  ],
  setup(props, { emit }) {
    const { $gettext } = useGettext()

    const currentZoomDisplayValue = computed(() => {
      console.log('current zoom display: ' + props.currentImageZoom)
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

    const calculateZoom = (zoom, factor) => {
      console.log('calculating zoom')
      return Math.round(zoom * factor * 20) / 20
    }
    const imageShrink = () => {
      console.log('current zoom: ' + props.currentImageZoom)
      emit('setZoom', Math.max(0.1, calculateZoom(props.currentImageZoom, 0.8)))
    }
    const imageZoom = () => {
      console.log('current zoom: ' + props.currentImageZoom)
      const maxZoomValue = calculateZoom(9, 1.25)
      emit('setZoom', Math.min(calculateZoom(props.currentImageZoom, 1.25), maxZoomValue))
    }
    const imageRotateLeft = () => {
      console.log('current rotation: ' + props.currentImageRotation)
      emit('setRotation', props.currentImageRotation === -270 ? 0 : props.currentImageRotation - 90)
    }
    const imageRotateRight = () => {
      console.log('rotate right')
      emit('setRotation', props.currentImageRotation === 270 ? 0 : props.currentImageRotation + 90)
    }
    // TODO: draft only, properly implement the following new functionalities
    const imageShowMetadata = () => {
      console.log('toggle show metadata')
      emit('toggleShowMetadata', props.isShowMetadataActivated === true ? true : false)
    }

    return {
      currentZoomDisplayValue,
      screenreaderFileCount,
      ariaHiddenFileCount,
      enterFullScreenDescription: $gettext('Enter full screen mode'),
      exitFullScreenDescription: $gettext('Exit full screen mode'),
      imageShrinkDescription: $gettext('Shrink the image'),
      imageZoomDescription: $gettext('Enlarge the image'),
      imageOriginalSizeDescription: $gettext('Show the image at its normal size'),
      imageRotateLeftDescription: $gettext('Rotate the image 90 degrees to the left'),
      imageRotateRightDescription: $gettext('Rotate the image 90 degrees to the right'),
      previousDescription: $gettext('Show previous DICOM file in folder'),
      nextDescription: $gettext('Show next DICOM file in folder'),
      imageFlipHorizontalDescription: $gettext('Flip the image horizontally'),
      imageFlipVerticalDescription: $gettext('Flip the image vertically'),
      imageInvertDescription: $gettext('Invert the colours of the image'),
      imageResetDescription: $gettext('Reset all image manipulations'),
      imageShowMetadataDescription: $gettext('Show DICOM metadata'),
      imageHideMetadataDescription: $gettext('Hide DICOM metadata'),
      imageShrink,
      imageZoom,
      imageRotateLeft,
      imageRotateRight,
      imageShowMetadata
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
