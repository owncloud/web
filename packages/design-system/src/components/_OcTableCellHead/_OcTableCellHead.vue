<template>
  <oc-table-cell
    type="th"
    :align-h="alignH"
    :align-v="alignV"
    :width="width"
    :wrap="wrap"
    class="oc-th"
    @click="$emit('click', $event)"
  >
    <slot />
  </oc-table-cell>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import OcTableCell from '../OcTableCell/OcTableCell.vue'

export default defineComponent({
  name: 'OcTh',
  status: 'ready',
  release: '2.1.0',
  components: { OcTableCell },
  props: {
    alignH: {
      type: String,
      default: 'left',
      validator: (alignment: string) => ['left', 'center', 'right'].includes(alignment)
    },
    alignV: {
      type: String,
      default: 'middle',
      validator: (alignment: string) => ['top', 'middle', 'bottom'].includes(alignment)
    },
    width: {
      type: String,
      default: 'auto',
      validator: (width: string) => ['auto', 'shrink', 'expand'].includes(width)
    },
    wrap: {
      type: String,
      default: 'nowrap',
      validator: (wrap: string) => ['break', 'nowrap', 'truncate'].includes(wrap)
    }
  },
  emits: ['click']
})
</script>
<style lang="scss">
.oc-th {
  color: var(--oc-color-text-muted);
  font-weight: inherit;

  &[aria-sort] {
    cursor: pointer;
  }
}
</style>
