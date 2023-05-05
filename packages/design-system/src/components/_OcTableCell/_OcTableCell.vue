<template>
  <component :is="type" :class="cellClasses" @click="$emit('click', $event)">
    <slot />
  </component>
</template>
<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'OcTableCell',
  status: 'ready',
  release: '2.1.0',
  props: {
    type: {
      type: String,
      default: 'td',
      required: false,
      validator: (type: string) => ['td', 'th'].includes(type)
    },
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
      default: null,
      validator: (wrap: string) => ['break', 'nowrap', 'truncate'].includes(wrap) || !wrap
    }
  },
  emits: ['click'],
  computed: {
    cellClasses() {
      const classes = [
        'oc-table-cell',
        `oc-table-cell-align-${this.alignH}`,
        `oc-table-cell-align-${this.alignV}`,
        `oc-table-cell-width-${this.width}`
      ]
      if (this.wrap) {
        classes.push(`oc-text-${this.wrap}`)
      }
      return classes
    }
  }
})
</script>
<style lang="scss">
.oc-table-cell {
  /* padding is not configurable until we need it */
  padding: 0 var(--oc-space-small);
  position: relative;

  &-align {
    &-left {
      text-align: left;
    }

    &-center {
      text-align: center;
    }

    &-right {
      text-align: right;
    }

    &-top {
      vertical-align: top;
    }

    &-middle {
      vertical-align: middle;
    }

    &-bottom {
      vertical-align: bottom;
    }
  }

  &-width {
    &-shrink {
      width: 1px;
    }

    &-expand {
      min-width: 150px;
    }
  }
}
</style>
