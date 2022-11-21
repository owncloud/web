<template>
  <oc-table-cell
    type="th"
    :align-h="alignH"
    :align-v="alignV"
    :width="width"
    :wrap="wrap"
    class="oc-th"
  >
    <slot />
  </oc-table-cell>
</template>
<script>
import OcTableCell from '../_OcTableCell/_OcTableCell.vue'

export default {
  name: 'OcTh',
  status: 'ready',
  release: '2.1.0',
  components: { OcTableCell },
  props: {
    alignH: {
      type: String,
      default: 'left',
      validator: (alignment) => /(left|center|right)/.test(alignment)
    },
    alignV: {
      type: String,
      default: 'middle',
      validator: (alignment) => /(top|middle|bottom)/.test(alignment)
    },
    width: {
      type: String,
      default: 'auto',
      validator: (width) => /(auto|shrink|expand)/.test(width)
    },
    wrap: {
      type: String,
      default: 'nowrap',
      validator: (wrap) => /(break|nowrap|truncate)/.test(wrap)
    }
  }
}
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
