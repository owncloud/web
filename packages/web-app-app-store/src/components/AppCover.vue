<template>
  <div class="app-cover-image">
    <oc-img v-if="app.coverImage?.url" :src="app.coverImage?.url" />
    <div v-else class="fallback-icon">
      <oc-icon name="computer" size="xxlarge" />
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { App } from '../types'

export default defineComponent({
  name: 'AppCover',
  props: {
    app: {
      type: Object as PropType<App>,
      required: true
    }
  }
})
</script>

<style lang="scss">
.app-cover-image {
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
</style>
