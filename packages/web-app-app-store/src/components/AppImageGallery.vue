<template>
  <div class="app-image-wrapper">
    <div class="app-image">
      <oc-img v-if="currentImage?.url" :src="currentImage?.url" />
      <div v-else class="fallback-icon">
        <oc-icon name="computer" size="xxlarge" />
      </div>
    </div>
    <ol v-if="hasPagination" class="app-image-pagination">
      <li>
        <oc-button class="oc-p-xs" @click="previousImage">
          <oc-icon name="arrow-left-s" />
        </oc-button>
      </li>
      <li v-for="(image, index) in images" :key="`gallery-page-${index}`">
        <oc-button
          class="oc-py-xs"
          :disabled="index === currentImageIndex"
          @click="setImageIndex(index)"
        >
          {{ index + 1 }}
        </oc-button>
      </li>
      <li>
        <oc-button class="oc-p-xs" @click="nextImage">
          <oc-icon name="arrow-right-s" />
        </oc-button>
      </li>
    </ol>
  </div>
</template>
<script lang="ts">
import { computed, defineComponent, PropType, ref, unref } from 'vue'
import { App, AppImage } from '../types'

export default defineComponent({
  name: 'AppImageGallery',
  props: {
    app: {
      type: Object as PropType<App>,
      required: true
    },
    showPagination: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  setup(props) {
    const images = computed(() => {
      return [props.app.coverImage, ...props.app.screenshots]
    })

    const currentImageIndex = ref<number>(0)
    const currentImage = computed<AppImage>(() => unref(images)[unref(currentImageIndex)])
    const hasPagination = computed(() => props.showPagination && unref(images).length > 1)
    const nextImage = () => {
      currentImageIndex.value = (unref(currentImageIndex) + 1) % unref(images).length
    }
    const previousImage = () => {
      currentImageIndex.value =
        (unref(currentImageIndex) - 1 + unref(images).length) % unref(images).length
    }
    const setImageIndex = (index: number) => {
      currentImageIndex.value = index
    }

    return {
      currentImage,
      currentImageIndex,
      images,
      hasPagination,
      nextImage,
      previousImage,
      setImageIndex
    }
  }
})
</script>

<style lang="scss">
.app-image {
  width: 100%;

  img {
    width: 100%;
    max-width: 100%;
    aspect-ratio: 3/2;
    object-fit: cover;
  }

  .fallback-icon {
    width: 100%;
    aspect-ratio: 3/2;
    background-color: white;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
.app-image-pagination {
  width: 100%;
  padding: 0;
  margin-top: var(--oc-space-small);
  list-style: none;
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
  align-items: center;
  justify-content: center;
}
</style>
