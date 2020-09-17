<template>
  <div>
    <oc-button
      v-for="action in filteredActions"
      :id="`files-quick-action-${action.id}`"
      :key="action.label"
      :aria-label="action.label"
      :uk-tooltip="action.label"
      variation="raw"
      class="uk-margin-xsmall-right"
      @click.native.stop="action.handler({ item, client: $client, store: $store })"
    >
      <oc-icon :name="action.icon" aria-hidden="true" size="small" class="uk-flex" />
    </oc-button>
  </div>
</template>

<script>
import filterObject from 'filter-obj'

export default {
  name: 'QuickActions',

  props: {
    actions: {
      type: Object,
      required: true
    },
    item: {
      type: Object,
      required: true
    }
  },

  computed: {
    filteredActions() {
      return filterObject(this.actions, (key, value) => {
        return value.displayed(this.item, this.$store) === true
      })
    }
  }
}
</script>
