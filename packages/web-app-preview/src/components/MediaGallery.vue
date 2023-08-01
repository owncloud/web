<template>
  <div class="media-gallery oc-box-shadow-medium">
    <div class="media-display">
      <div v-for="(mediaFile, index) in activeMediaFiles" :key="index" class="media-container">
        <button
          :class="index === 2 ? 'media-view-active' : 'media-view'"
          @click="handleUpdateActiveMediaFile(mediaFile)"
        >
          <img
            v-if="mediaFile && mediaFile.mimeType.startsWith('image')"
            :key="`media-image-${mediaFile.id}`"
            :src="mediaFile.url"
            :alt="mediaFile.name"
            :data-id="mediaFile.id"
            class="gallery-image"
          />
          <p v-else-if="mediaFile">This is not an image</p>
        </button>
      </div>
    </div>
    <div class="tools-sidebar">
      <p>
        {{ activeIndex }}
      </p>
      <p>{{ sortBy }}</p>
      <p>{{ sortDir }}</p>
    </div>
  </div>
</template>

<script lang="ts">
import { computed } from 'vue'
import { defineComponent } from 'vue'
import { MediaGalleryFile } from '../helpers'
import { ComputedRef } from 'vue'
import { useSlicedGalleryImageList } from '../composables'

export default defineComponent({
  name: 'MediaGallery',
  props: {
    mediaFiles: {
      type: Array<MediaGalleryFile>,
      required: true
    },
    activeIndex: {
      type: Number,
      required: true
    },
    // eslint-disable-next-line vue/require-prop-types
    sortBy: {
      default: null
    },
    // eslint-disable-next-line vue/require-prop-types
    sortDir: {
      default: null
    }
  },
  emits: ['updateActiveMediaFile'],
  setup(props, { emit }) {
    const activeMediaFiles: ComputedRef<MediaGalleryFile[]> = computed(() =>
      useSlicedGalleryImageList(props.mediaFiles, props.activeIndex)
    )

    function handleUpdateActiveMediaFile(mediaFile) {
      const mediaFileindex = props.mediaFiles.findIndex((file) => file.id === mediaFile.id)
      if (mediaFileindex !== props.activeIndex) {
        emit('updateActiveMediaFile', mediaFileindex)
      }
    }
    return {
      activeMediaFiles,
      handleUpdateActiveMediaFile
    }
  }
})
</script>

<style lang="scss" scoped>
.media-gallery {
  background-color: var(--oc-color-background-default);
  height: calc(22vh - 3rem);
  border-radius: 8px;
  display: flex;
}
.media-display {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
  height: 100%;
  flex-grow: 1;
}

.media-container {
  height: 100%;
  width: 100%;
  padding: 4px;
  box-sizing: border-box;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
}
.media-view {
  width: 80%;
  height: 80%;
  overflow: hidden;
  padding: 0;
  border: none;
  background-color: rgba(0, 0, 0, 0);
  border-radius: 4px;
}

.media-view-active {
  width: 80%;
  height: 80%;
  overflow: hidden;
  padding: 0;
  border: none;
  background-color: rgba(0, 0, 0, 0);
  border-radius: 4px;
}

.gallery-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  cursor: pointer;
}

.tools-sidebar {
  width: 3rem;
  border-left: 1px solid var(--oc-color-background-highlight);
}
</style>
