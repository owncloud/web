<template>
  <oc-button
    :id="`context-menu-trigger-generic`"
    v-oc-tooltip="contextMenuLabel"
    :aria-label="contextMenuLabel"
    appearance="raw"
  >
    <oc-icon name="more-2" />
    <oc-drop
      :ref="`context-menu-drop-ref-generic`"
      :drop-id="`context-menu-drop-generic`"
      :toggle="`#context-menu-trigger-generic`"
      class="generic-dropdown"
      position="bottom-end"
      mode="click"
      close-on-click
      padding-size="small"
    >
      test123
    </oc-drop>
  </oc-button>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { extractDomSelector } from 'web-client/src/helpers'
import { useGettext } from 'vue3-gettext'

export default defineComponent({
  name: 'ContextMenuQuickAction',
  props: {},
  setup() {
    const { $gettext } = useGettext()
    const contextMenuLabel = computed(() => $gettext('Show context menu'))
    return { contextMenuLabel }
  }
})
</script>
