<template>
  <ul class="oc-mb-rm oc-p-rm">
    <li v-for="author in app.authors" :key="author.name" class="app-author-item">
      <a v-if="author.url" :href="author.url" target="_blank">{{ author.name }}</a>
      <span v-else>{{ author.name }}</span>
    </li>
  </ul>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { App } from '../types'

export default defineComponent({
  props: {
    app: {
      type: Object as PropType<App>,
      required: true
    }
  }
})
</script>

<style lang="scss">
.app-author-item {
  list-style: none;
}
</style>
