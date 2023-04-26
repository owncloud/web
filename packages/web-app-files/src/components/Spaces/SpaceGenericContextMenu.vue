<template>
  <oc-button id="context-menu-trigger-generic" appearance="raw">
    <oc-drop
      drop-id="context-menu-drop-generic"
      toggle="#context-menu-trigger-generic"
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
import { useGettext } from 'vue3-gettext'

export default defineComponent({
  name: 'SpaceGenericContextMenu',
  setup() {
    const { $gettext } = useGettext()
    const contextMenuLabel = computed(() => $gettext('Show context menu'))
    return { contextMenuLabel }
  }
})
</script>

<style lang="scss">
#context-menu-trigger-generic {
  visibility: hidden;
  width: 0;
  height: 0;
}
</style>
