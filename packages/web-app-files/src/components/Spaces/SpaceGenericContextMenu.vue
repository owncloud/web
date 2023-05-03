<template>
  <oc-button id="context-menu-trigger-generic" appearance="raw">
    <oc-drop
      drop-id="context-menu-drop-generic"
      toggle="#context-menu-trigger-generic"
      position="bottom-end"
      class="oc-files-context-actions"
      mode="click"
      close-on-click
      padding-size="small"
    >
      <action-menu-item
        v-for="(action, actionIndex) in items"
        :key="`section-${action.name}-action-${actionIndex}`"
        :action="action"
        :action-options="actionOptions"
        class="context-menu oc-files-context-action oc-px-s oc-rounded oc-menu-item-hover"
      />
    </oc-drop>
  </oc-button>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, unref } from 'vue'
import { useGettext } from 'vue3-gettext'
import { useFileActionsCreateNewFolder } from 'web-app-files/src/composables/actions/files/useFileActionsCreateNewFolder'
import { SpaceResource } from 'web-client/src'
import { useStore } from 'web-pkg/src'
import ActionMenuItem from 'web-pkg/src/components/ContextActions/ActionMenuItem.vue'

export default defineComponent({
  name: 'SpaceGenericContextMenu',
  components: { ActionMenuItem },
  props: {
    items: {
      type: Array,
      required: true,
      default: []
    },
    space: {
      type: Object as PropType<SpaceResource>,
      required: false,
      default: null
    }
  },
  setup(props) {
    const { $gettext } = useGettext()
    const store = useStore()
    const contextMenuLabel = computed(() => $gettext('Show context menu'))

    const { actions } = useFileActionsCreateNewFolder({ store, space: props.space })
    console.log(unref(actions)[0])
    props.items.push(unref(actions)[0])
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
