<template>
  <oc-button id="context-menu-trigger-whitespace" appearance="raw">
    <oc-drop
      drop-id="context-menu-drop-whitespace"
      toggle="#context-menu-trigger-whitespace"
      position="bottom-end"
      mode="click"
      class="whitespace-context-actions-list"
      close-on-click
      padding-size="small"
    >
      <oc-list>
        <action-menu-item
          v-for="(action, actionIndex) in menuItemsActions"
          :key="`section-${action.name}-action-${actionIndex}`"
          :action="action"
          :action-options="actionOptions"
          class="oc-px-s oc-rounded oc-menu-item-hover"
          :data-testid="`whitespace-context-menu-item-${action.name}`"
        />
      </oc-list>
    </oc-drop>
  </oc-button>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, unref } from 'vue'
import { useGettext } from 'vue3-gettext'
import { useFileActionsPaste, useFileActionsShowDetails } from '@ownclouders/web-pkg'
import { useFileActionsCreateNewFolder } from '@ownclouders/web-pkg'
import { SpaceResource } from '@ownclouders/web-client/src'
import { useStore } from '@ownclouders/web-pkg'
import { ActionMenuItem } from '@ownclouders/web-pkg'

export default defineComponent({
  name: 'WhitespaceContextMenu',
  components: { ActionMenuItem },
  props: {
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
    const currentFolder = computed(() => store.getters['Files/currentFolder'])
    const actionOptions = computed(() => ({
      space: props.space,
      resources: [currentFolder.value]
    }))
    const { actions: createNewFolderAction } = useFileActionsCreateNewFolder({
      store,
      space: props.space
    })
    const { actions: showDetailsAction } = useFileActionsShowDetails({ store })
    const { actions: pasteAction } = useFileActionsPaste({ store })

    const menuItemsActions = computed(() => {
      return [
        ...unref(createNewFolderAction),
        ...unref(pasteAction),
        ...unref(showDetailsAction)
      ].filter((item) => item.isEnabled(unref(actionOptions)))
    })

    return { contextMenuLabel, actionOptions, currentFolder, menuItemsActions }
  }
})
</script>

<style lang="scss">
#context-menu-trigger-whitespace {
  visibility: hidden;
  width: 0;
  height: 0;
}
.whitespace-context-actions-list {
  .oc-card {
    padding-left: 0px !important;
    padding-right: 0px !important;
  }
  text-align: left;
  white-space: normal;

  a,
  button,
  span {
    display: inline-flex;
    font-weight: normal !important;
    gap: 10px;
    justify-content: flex-start;
    vertical-align: top;
    width: 100%;
    text-align: left;
  }
}
</style>
