<template>
  <component :is="type" :class="cellClasses">
    <slot />
  </component>
</template>
<script>
export default {
  name: 'OcTableCell',
  status: 'ready',
  release: '2.1.0',
  props: {
    type: {
      type: String,
      default: 'td',
      required: false,
      validator: (type) => /(td|th)/.test(type)
    },
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
      default: null,
      validator: (wrap) => (wrap ? /(break|nowrap|truncate)/.test(wrap) : true)
    }
  },
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
}
</script>
<style lang="scss">
.oc-table-cell {
  /* padding is not configurable until we need it */
  padding: 0 var(--oc-space-xsmall);
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
