<template>
  <div>
    <oc-list
      id="oc-appbar-batch-actions"
      :class="{ 'oc-appbar-batch-actions-squashed': limitedScreenSpace }"
    >
      <action-menu-item
        v-for="(action, index) in actions"
        :key="`action-${index}`"
        :action="action"
        :action-options="actionOptions"
        appearance="raw"
        class="batch-actions oc-mr-s"
        :shortcut-hint="false"
        :show-tooltip="limitedScreenSpace"
      />
    </oc-list>
  </div>
</template>

<script lang="ts">
import ActionMenuItem from './ContextActions/ActionMenuItem.vue'
import { defineComponent, PropType } from 'vue'
import { Action, ActionOptions } from '../composables'

export default defineComponent({
  name: 'BatchActions',
  components: { ActionMenuItem },
  props: {
    actions: {
      type: Array as PropType<Action[]>,
      required: true
    },
    actionOptions: {
      type: Object as PropType<ActionOptions>,
      required: true
    },
    limitedScreenSpace: {
      type: Boolean,
      default: false,
      required: false
    }
  }
})
</script>

<style lang="scss">
#oc-appbar-batch-actions {
  display: block;

  .action-menu-item {
    padding-left: var(--oc-space-small) !important;
    padding-right: var(--oc-space-small) !important;
    gap: var(--oc-space-xsmall) !important;
  }
  .action-menu-item:hover:not([disabled]),
  .action-menu-item:focus:not([disabled]) {
    background-color: var(--oc-color-background-hover);
    border-color: var(--oc-color-background-hover);
  }

  li {
    float: left !important;
  }
  @media only screen and (min-width: 1200px) {
    align-items: center;
    display: flex;

    li {
      margin-top: 0;
      margin-bottom: 0;
    }
  }
}
.oc-appbar-batch-actions-squashed .oc-files-context-action-label {
  display: none;
}
</style>
