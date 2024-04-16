<template>
  <oc-button
    :id="`context-menu-trigger-${resourceDomSelector(item)}`"
    v-oc-tooltip="contextMenuLabel"
    :aria-label="contextMenuLabel"
    appearance="raw"
    @click.stop.prevent="
      $emit('quickActionClicked', {
        event: $event,
        dropdown: $refs[`context-menu-drop-ref-${resourceDomSelector(item)}`]
      })
    "
  >
    <oc-icon name="more-2" />
    <oc-drop
      :ref="`context-menu-drop-ref-${resourceDomSelector(item)}`"
      :drop-id="`context-menu-drop-${resourceDomSelector(item)}`"
      :toggle="`#context-menu-trigger-${resourceDomSelector(item)}`"
      class="oc-overflow-hidden"
      position="bottom-end"
      mode="click"
      close-on-click
      padding-size="small"
    >
      <slot name="contextMenu" :item="item" />
    </oc-drop>
  </oc-button>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { extractDomSelector } from '@ownclouders/web-client'
import { useGettext } from 'vue3-gettext'

export default defineComponent({
  name: 'ContextMenuQuickAction',
  props: {
    item: {
      type: Object,
      required: true
    },
    resourceDomSelector: {
      type: Function,
      required: false,
      default: (resource) => extractDomSelector(resource.id)
    }
  },
  emits: ['quickActionClicked'],
  setup() {
    const { $gettext } = useGettext()
    const contextMenuLabel = computed(() => $gettext('Show context menu'))
    return { contextMenuLabel }
  }
})
</script>
