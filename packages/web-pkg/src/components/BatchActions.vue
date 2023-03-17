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
        :action-options="{ space, resources: items }"
        appearance="outline"
        class="batch-actions oc-mr-s"
        :shortcut-hint="false"
        :show-tooltip="limitedScreenSpace"
      />
    </oc-list>
  </div>
</template>

<script lang="ts">
import ActionMenuItem from 'web-pkg/src/components/ContextActions/ActionMenuItem.vue'
import { defineComponent, PropType } from 'vue'
import { Resource, SpaceResource } from 'web-client'
import { Action } from '../composables/actions'

export default defineComponent({
  name: 'BatchActions',
  components: { ActionMenuItem },
  props: {
    items: {
      type: Array as PropType<Resource[]>,
      required: true
    },
    actions: {
      type: Array as PropType<Action[]>,
      required: true
    },
    space: {
      type: Object as PropType<SpaceResource>,
      required: false,
      default: null
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
  li {
    float: left !important;
  }
  @media only screen and (min-width: 1200px) {
    li {
      margin-top: 0;
      margin-bottom: 0;
    }
    align-items: center;
    display: flex;
  }
}
.oc-appbar-batch-actions-squashed .oc-files-context-action-label {
  display: none;
}
</style>
