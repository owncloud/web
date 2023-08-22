<template>
  <div
    class="oc-position-small oc-position-bottom-center preview-details"
    :class="{ lightbox: isFullScreenModeActivated }"
  >
    <div
      class="oc-background-brand oc-p-s oc-width-large oc-flex oc-flex-middle oc-flex-center oc-flex-around preview-controls-action-bar"
    >
      <p v-if="!isFolderLoading" class="oc-m-rm preview-controls-action-count">
        <span aria-hidden="true" v-text="ariaHiddenFileCount" />
        <span class="oc-invisible-sr" v-text="screenreaderFileCount" />
      </p>
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
      <div v-if="isImage" class="oc-flex oc-flex-middle">
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
      <div v-if="isImage" class="oc-flex">
        <oc-button
          v-oc-tooltip="isEditModeActivated ? viewModeDescription : editModeDescription"
          class="preview-controls-fullscreen"
          appearance="raw-inverse"
          variation="brand"
          :aria-label="isEditModeActivated ? viewModeDescription : editModeDescription"
          @click="$emit('toggleEditMode')"
        >
          <oc-icon
            fill-type="line"
            :name="isEditModeActivated ? 'eye' : 'edit-2'"
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
    isEditModeActivated: {
      type: Boolean,
      default: false
    },
    isFolderLoading: {
      type: Boolean,
      default: false
    },
    isImage: {
      type: Boolean,
      default: false
    },
    currentImageZoom: {
      type: Number,
      default: 1
    }
  },
  emits: ['setZoom', 'toggleFullScreen', 'toggleEditMode'],
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

    const calculateZoom = (zoom, factor) => {
      return Math.round(zoom * factor * 20) / 20
    }
    const imageShrink = () => {
      emit('setZoom', Math.max(0.1, calculateZoom(props.currentImageZoom, 0.8)))
    }
    const imageZoom = () => {
      const maxZoomValue = calculateZoom(9, 1.25)
      emit('setZoom', Math.min(calculateZoom(props.currentImageZoom, 1.25), maxZoomValue))
    }

    return {
      currentZoomDisplayValue,
      screenreaderFileCount,
      ariaHiddenFileCount,
      enterFullScreenDescription: $gettext('Enter full screen mode'),
      exitFullScreenDescription: $gettext('Exit full screen mode'),
      editModeDescription: $gettext('Enter Edit mode'),
      viewModeDescription: $gettext('Enter View mode'),
      imageShrinkDescription: $gettext('Shrink the image'),
      imageZoomDescription: $gettext('Enlarge the image'),
      imageOriginalSizeDescription: $gettext('Show the image at its normal size'),
      imageShrink,
      imageZoom
    }
  }
})
</script>

<style lang="scss" scoped>
.preview-details {
  bottom: calc(22vh - 1rem);
}

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
