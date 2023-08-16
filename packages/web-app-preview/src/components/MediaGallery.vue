<template>
  <div>
    <div class="media-gallery oc-box-shadow-medium">
      <button
        :aria-label="$gettext('Previous image')"
        class="navigation-button left-navigation-button"
        @click="$emit('handleGoPrev')"
      >
        <oc-icon name="arrow-drop-left" size="xlarge" fill-type="line" />
      </button>
      <div class="media-display">
        <div v-for="(mediaFile, index) in activeMediaFiles" :key="index" class="media-container">
          <button
            v-if="mediaFile"
            v-oc-tooltip="mediaFile.name"
            :aria-label="$gettext(`${mediaFile.name}`)"
            :class="index === 2 ? 'media-view-active' : 'media-view'"
            @click="handleUpdateActiveMediaFile(mediaFile)"
          >
            <img
              v-if="mediaFile.mimeType.toLowerCase().startsWith('image')"
              :key="`media-image-${mediaFile.id}`"
              :src="mediaFile.url"
              :alt="mediaFile.name"
              :data-id="mediaFile.id"
              class="gallery-image"
            />
            <div v-else-if="mediaFile.mimeType.toLowerCase().startsWith('video')">
              <oc-icon name="resource-type-video" size="large" />
              <p class="video-text">{{ mediaFile.name }}</p>
            </div>
            <div v-else-if="mediaFile.mimeType.toLowerCase().startsWith('audio')">
              <oc-icon name="resource-type-audio" size="large" fill-type="fill" />
              <p class="video-text">{{ mediaFile.name }}</p>
            </div>
          </button>
          <div v-else :aria-label="$gettext('Empty image container')" class="media-view" />
        </div>
      </div>
      <button
        :aria-label="$gettext('Next image')"
        class="navigation-button"
        @click="$emit('handleGoNext')"
      >
        <oc-icon name="arrow-drop-right" size="xlarge" fill-type="line" />
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { computed } from 'vue'
import { defineComponent } from 'vue'
import { CachedFile, ProcessingToolsEnum } from '../helpers'
import { useSlicedGalleryImageList } from '../composables'
import { ref } from 'vue'
import { useStore } from 'web-pkg/src'

export default defineComponent({
  name: 'MediaGallery',
  props: {
    mediaFiles: {
      type: Array<CachedFile>,
      required: true
    },
    activeIndex: {
      type: Number,
      required: true
    }
  },
  emits: ['updateActiveMediaFile', 'handleGoNext', 'handleGoPrev'],
  setup(props, { emit }) {
    const store = useStore()
    const activeProcessingTool = computed(() => store.getters['Preview/getSelectedProcessingTool'])

    const activeMediaFiles = computed<CachedFile[]>(() =>
      useSlicedGalleryImageList(props.mediaFiles, props.activeIndex)
    )

    function handleUpdateActiveMediaFile(mediaFile) {
      const mediaFileindex = props.mediaFiles.findIndex((file) => file.id === mediaFile.id)
      if (mediaFileindex !== props.activeIndex && mediaFileindex !== undefined) {
        emit('updateActiveMediaFile', mediaFileindex)
      }
    }

    function preventArrowKeys(e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.stopPropagation()
      }
    }

    return {
      activeMediaFiles,
      ProcessingToolsEnum,
      activeProcessingTool,
      handleUpdateActiveMediaFile,
      preventArrowKeys
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
  padding: 4px;
  background-color: rgba(0, 0, 0, 0);
  border-radius: 4px;
  border: none;
  box-sizing: content-box;
  box-shadow: rgba(14, 30, 37, 0.12) 0px 2px 4px 0px, rgba(14, 30, 37, 0.32) 0px 2px 16px 0px;
}

.gallery-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  cursor: pointer;
}

.tools-sidebar {
  min-width: 4rem;
  border-left: 1px solid var(--oc-color-background-highlight);
  font-size: small;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-around;
}

.navigation-button {
  border: none;
  background-color: rgb(0, 0, 0, 0);
  width: 3rem;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;

  &:hover,
  &:focus,
  &:active {
    background-color: var(--oc-color-background-highlight);
  }
}

.left-navigation-button {
  border-top-left-radius: 8px;
  border-bottom-left-radius: 8px;
}

.video-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.zoom-button {
  border: none;
  padding: 0;
  margin: 0;
  text-align: left;
  box-sizing: border-box;
  width: 80%;
  background-color: var(--oc-color-background-default);
  display: flex;
  justify-content: center;
}

.zoom-input {
  border: none;
  padding: 0;
  margin: 0;
  box-sizing: border-box;
  width: 80%;
  display: flex;
  justify-content: center;
  text-align: center;
  background-color: var(--oc-color-background-default);

  &:hover,
  &:focus,
  &:active {
    outline: none;
  }
}

.active-index-paragraph {
  margin: 0;
}

.zoom-handler {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0;
}

.rotate-buttons {
  width: 100%;
  display: flex;
  justify-content: space-around;
}

.rotate-button {
  background-color: rgb(0, 0, 0, 0);
  padding: 0.1rem;
}
</style>
