<template>
  <div>
    <oc-list
      id="oc-spaces-appbar-batch-actions"
      :class="{ 'oc-spaces-appbar-batch-actions-squashed': limitedScreenSpace }"
    >
      <action-menu-item
        v-for="(action, index) in actions"
        :key="`action-${index}`"
        :action="action"
        :items="selectedSpaces"
        appearance="outline"
        class="oc-mr-s"
        :show-tooltip="limitedScreenSpace"
      />
    </oc-list>
  </div>
</template>

<script lang="ts">
import ActionMenuItem from 'web-pkg/src/components/ContextActions/ActionMenuItem.vue'
import Delete from 'web-pkg/src/mixins/spaces/delete'
import Disable from 'web-pkg/src/mixins/spaces/disable'
import Restore from 'web-pkg/src/mixins/spaces/restore'
import { computed, defineComponent, getCurrentInstance, PropType } from 'vue'
import { SpaceResource } from 'web-client'

export default defineComponent({
  name: 'ActionsPanel',
  components: { ActionMenuItem },
  mixins: [Delete, Disable, Restore],
  props: {
    selectedSpaces: {
      type: Array as PropType<Array<SpaceResource>>,
      required: true
    },
    limitedScreenSpace: {
      type: Boolean,
      default: false,
      required: false
    }
  },
  setup(props) {
    const instance = getCurrentInstance().proxy as any
    const actions = computed(() => {
      return [
        ...instance.$_restore_items,
        ...instance.$_delete_items,
        ...instance.$_disable_items
      ].filter((item) => item.isEnabled({ resources: props.selectedSpaces }))
    })
    return { actions }
  }
})
</script>

<style lang="scss">
#oc-spaces-appbar-batch-actions {
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
.oc-spaces-appbar-batch-actions-squashed .oc-files-context-action-label {
  display: none;
}
</style>
