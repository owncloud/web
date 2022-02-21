<template>
  <div class="oc-flex">
    <oc-button
      v-for="action in filteredActions"
      :key="action.label($gettext)"
      v-oc-tooltip="action.label($gettext)"
      :aria-label="action.label($gettext)"
      appearance="raw"
      class="oc-mr-xs quick-action-button"
      :class="`files-quick-action-${action.id}`"
      @click="action.handler({ item, client: $client, store: $store, $gettext })"
    >
      <oc-icon :name="action.icon" fill-type="line" class="oc-flex" />
    </oc-button>
  </div>
</template>

<script>
import pickBy from 'lodash-es/pickBy'

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
      return pickBy(this.actions, (action) => action.displayed(this.item, this.$store) === true)
    }
  }
}
</script>

<style lang="scss">
.quick-action-button {
  padding: calc(1.5 * var(--oc-space-xsmall)) !important;
  &:hover {
    background-color: var(--oc-color-background-muted) !important;
  }
}
</style>
