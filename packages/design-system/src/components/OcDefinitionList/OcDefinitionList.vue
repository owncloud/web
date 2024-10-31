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
 * Definition lists are used to visually communicate key-value pairs.
 * They are useful for displaying metadata, definitions, and other data that is best represented in a key-value format.
 * @items - An array of objects with `term` and `definition` properties.
 *
 */

interface DefinitionItem {
  term: string
  definition: string
}

export default defineComponent({
  name: 'OcDefinitionList',
  status: 'ready',
  release: '16.0.0',
  props: {
    /**
     * The items to display in the list.
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
