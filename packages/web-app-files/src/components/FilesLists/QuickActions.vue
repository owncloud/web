<template>
  <div class="uk-flex">
    <oc-button
      v-for="action in filteredActions"
      :key="action.label"
      v-oc-tooltip="$gettext(action.label)"
      :aria-label="$gettext(action.label)"
      appearance="raw"
      class="oc-mr-xs"
      :class="`files-quick-action-${action.id}`"
      @click.stop="action.handler({ item, client: $client, store: $store })"
    >
      <oc-icon :name="action.icon" class="uk-flex" />
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
