<template>
  <div>
    <quota-modal
      v-if="quotaModalIsOpen"
      :cancel="closeQuotaModal"
      :space="selectedSpaces[0]"
      @space-quota-updated="spaceQuotaUpdated"
    />
    <oc-list id="oc-spaces-actions-sidebar" class-name="oc-mt-s">
      <action-menu-item
        v-for="(action, index) in actions"
        :key="`action-${index}`"
        :action="action"
        :items="selectedSpaces"
        class="oc-py-xs"
      />
    </oc-list>
  </div>
</template>

<script lang="ts">
import ActionMenuItem from 'web-pkg/src/components/ContextActions/ActionMenuItem.vue'
import Rename from 'web-pkg/src/mixins/spaces/rename'
import Delete from 'web-pkg/src/mixins/spaces/delete'
import Disable from 'web-pkg/src/mixins/spaces/disable'
import Restore from 'web-pkg/src/mixins/spaces/restore'
import EditDescription from 'web-pkg/src/mixins/spaces/editDescription'
import EditQuota from 'web-pkg/src/mixins/spaces/editQuota'
import QuotaModal from 'web-pkg/src/components/Spaces/QuotaModal.vue'
import { computed, defineComponent, getCurrentInstance, PropType } from 'vue'
import { SpaceResource } from 'web-client'

export default defineComponent({
  name: 'ActionsPanel',
  components: { ActionMenuItem, QuotaModal },
  mixins: [Rename, Delete, EditDescription, Disable, Restore, EditQuota],
  props: {
    selectedSpaces: {
      type: Array as PropType<Array<SpaceResource>>,
      required: true
    }
  },
  setup(props) {
    const instance = getCurrentInstance().proxy as any
    const actions = computed(() => {
      return [
        ...instance.$_rename_items,
        ...instance.$_editDescription_items,
        ...instance.$_editQuota_items,
        ...instance.$_restore_items,
        ...instance.$_delete_items,
        ...instance.$_disable_items
      ].filter((item) => item.isEnabled({ resources: props.selectedSpaces }))
    })
    const quotaModalIsOpen = computed(() => instance.$data.$_editQuota_modalOpen)
    const closeQuotaModal = () => {
      instance.$_editQuota_closeModal()
    }
    const spaceQuotaUpdated = (quota) => {
      instance.$data.$_editQuota_selectedSpace.spaceQuota = quota
    }
    return { actions, quotaModalIsOpen, closeQuotaModal, spaceQuotaUpdated }
  }
})
</script>

<style lang="scss">
#oc-spaces-actions-sidebar {
  > li a,
  > li a:hover {
    color: var(--oc-color-swatch-passive-default);
    display: inline-flex;
    gap: 10px;
    vertical-align: top;
  }
}
</style>
