<template>
  <dl class="details-list">
    <!-- eslint-disable-next-line vue/no-v-for-template-key -->
    <template v-for="item in items" :key="item.term">
      <dt>{{ item.term }}</dt>
      <dd>{{ item.definition }}</dd>
    </template>
  </dl>
</template>

<script lang="ts">
import { PropType, defineComponent } from 'vue'

/**
 * Icons are used to visually communicate core parts of the product and
 * available actions. They can act as wayfinding tools to help users more
 * easily understand where they are in the product.
 */

interface DefinitionItem {
  term: string
  definition: string
}

export default defineComponent({
  name: 'OcDefinitionList',
  status: 'ready',
  release: '15.0.0-alpha.1',
  props: {
    /**
     * The name of the icon to display.
     */
    items: {
      type: Array as PropType<DefinitionItem[]>,
      required: true
    }
  }
})
</script>

<style lang="scss">
.details-list {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  dt,
  dd {
    margin-bottom: var(--oc-space-small);
  }
  dt {
    font-weight: bold;
    white-space: nowrap;
  }
  dd {
    margin-inline-start: var(--oc-space-medium);
  }
}
</style>
