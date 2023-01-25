<template>
  <div>
    <oc-list
      id="oc-groups-appbar-batch-actions"
      :class="{ 'oc-groups-appbar-batch-actions-squashed': limitedScreenSpace }"
    >
      <action-menu-item
        v-for="(action, index) in actions"
        :key="`action-${index}`"
        :action="action"
        :items="selectedGroups"
        appearance="outline"
        class="batch-actions oc-mr-s"
        :show-tooltip="limitedScreenSpace"
      />
    </oc-list>
  </div>
</template>

<script lang="ts">
import ActionMenuItem from 'web-pkg/src/components/ContextActions/ActionMenuItem.vue'
import Delete from '../../mixins/groups/delete'
import { computed, defineComponent, getCurrentInstance, PropType } from 'vue'
import { Group } from 'web-client/src/generated'

export default defineComponent({
  name: 'ActionsPanel',
  components: { ActionMenuItem },
  mixins: [Delete],
  props: {
    selectedGroups: {
      type: Array as PropType<Group[]>,
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
      return [...instance.$_delete_items].filter((item) =>
        item.isEnabled({ resources: props.selectedGroups })
      )
    })
    return { actions }
  }
})
</script>

<style lang="scss">
#oc-groups-appbar-batch-actions {
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
.oc-groups-appbar-batch-actions-squashed .oc-files-context-action-label {
  display: none;
}
</style>
