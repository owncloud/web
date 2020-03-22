<template>
  <oc-button
    variation="raw"
    :aria-label="ariaLabel"
    class="uk-flex uk-flex-middle oc-sortable-column-header"
    :class="{ 'oc-sortable-column-header-desc': isDesc, 'oc-sortable-column-header-asc': !isDesc }"
    @click="$_onClick"
  >
    <span class="uk-flex uk-flex-middle">
      <slot />
      <oc-icon
        v-if="isActive"
        :name="$_indicatorIconName"
        class="uk-text-middle"
        size="small"
        variation="passive"
      />
    </span>
  </oc-button>
</template>

<script>
export default {
  name: 'SortableColumnHeader',
  props: {
    ariaLabel: {
      type: String,
      required: true
    },
    isActive: {
      type: Boolean,
      default: false
    },
    isDesc: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    $_indicatorIconName() {
      return this.isDesc ? 'expand_less' : 'expand_more'
    }
  },
  methods: {
    $_onClick() {
      this.$emit('click', arguments)
    }
  }
}
</script>
