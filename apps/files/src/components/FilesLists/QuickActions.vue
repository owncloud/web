<template>
  <div>
    <oc-button
      v-for="action in actions"
      :id="`files-quick-action-${action.id}`"
      :key="action.label"
      :aria-label="$gettext(action.label)"
      variation="raw"
      @click.native.stop="action.handler({ item, client: $client, store: $store })"
    >
      <oc-icon :name="action.icon" aria-hidden="true" size="small" class="uk-flex" />
    </oc-button>
  </div>
</template>

<script>
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
  }
}
</script>
