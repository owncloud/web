<template>
  <ul class="oc-mb-rm oc-p-rm">
    <li v-for="resource in app.resources" :key="resource.label" class="app-resource-item">
      <a :href="resource.url" target="_blank" class="oc-flex-inline oc-flex-middle">
        <oc-icon v-if="resource.icon" :name="resource.icon" size="medium" class="oc-mr-xs" />
        {{ resource.label }}
      </a>
    </li>
  </ul>
</template>
<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { App } from '../types'

export default defineComponent({
  name: 'AppResources',
  props: {
    app: {
      type: Object as PropType<App>,
      required: true,
      default: (): App => undefined
    }
  }
})
</script>

<style lang="scss">
.app-resource-item {
  list-style: none;
}
</style>
