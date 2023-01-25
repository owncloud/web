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
      :popper-options="popperOptions"
      mode="click"
      close-on-click
      padding-size="small"
      @click.stop.prevent
    >
      <slot name="contextMenu" :item="item" />
    </oc-drop>
  </oc-button>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { extractDomSelector } from 'web-client/src/helpers'
import { useGettext } from 'vue3-gettext'
import { popperOptions as defaultPopperOptions } from 'web-pkg'

export default defineComponent({
  name: 'ContextMenuQuickAction',
  props: {
    item: {
      type: Object,
      required: true
    }
  },
  setup() {
    const { $gettext } = useGettext()
    const contextMenuLabel = computed(() => $gettext('Show context menu'))
    const popperOptions = computed(() => defaultPopperOptions)
    const resourceDomSelector = (item) => extractDomSelector(item.id)

    return { resourceDomSelector, contextMenuLabel, popperOptions }
  }
})
</script>
