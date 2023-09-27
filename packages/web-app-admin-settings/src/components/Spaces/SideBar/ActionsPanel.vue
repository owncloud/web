<template>
  <div>
    <quota-modal
      v-if="quotaModalIsOpen"
      :cancel="closeQuotaModal"
      :spaces="resources"
      :max-quota="maxQuota"
    />
    <oc-list id="oc-spaces-actions-sidebar" class-name="oc-mt-s">
      <action-menu-item
        v-for="(action, index) in actions"
        :key="`action-${index}`"
        class="oc-rounded"
        :action="action"
        :action-options="actionOptions"
      />
    </oc-list>
  </div>
</template>

<script lang="ts">
import { ActionMenuItem } from '@ownclouders/web-pkg'
import {
  useSpaceActionsDelete,
  useSpaceActionsDisable,
  useSpaceActionsEditDescription,
  useSpaceActionsEditQuota,
  useSpaceActionsRename,
  useSpaceActionsRestore
} from '@ownclouders/web-pkg'
import { QuotaModal } from '@ownclouders/web-pkg'
import { computed, defineComponent, inject, unref } from 'vue'
import { SpaceResource } from 'web-client'
import { useCapabilitySpacesMaxQuota, useStore } from '@ownclouders/web-pkg'

export default defineComponent({
  name: 'ActionsPanel',
  components: { ActionMenuItem, QuotaModal },
  setup() {
    const store = useStore()
    const resource = inject<SpaceResource>('resource')
    const resources = computed(() => {
      return [unref(resource)]
    })
    const actionOptions = computed(() => ({
      resources: unref(resources)
    }))

    const { actions: deleteActions } = useSpaceActionsDelete({ store })
    const { actions: disableActions } = useSpaceActionsDisable({ store })
    const { actions: editDescriptionActions } = useSpaceActionsEditDescription({ store })
    const {
      actions: editQuotaActions,
      modalOpen: quotaModalIsOpen,
      closeModal: closeQuotaModal
    } = useSpaceActionsEditQuota({ store })
    const { actions: renameActions } = useSpaceActionsRename({ store })
    const { actions: restoreActions } = useSpaceActionsRestore({ store })

    const actions = computed(() => {
      return [
        ...unref(renameActions),
        ...unref(editDescriptionActions),
        ...unref(editQuotaActions),
        ...unref(restoreActions),
        ...unref(deleteActions),
        ...unref(disableActions)
      ].filter((item) => item.isEnabled(unref(actionOptions)))
    })

    return {
      actions,
      actionOptions,
      maxQuota: useCapabilitySpacesMaxQuota(),
      quotaModalIsOpen,
      closeQuotaModal,
      resources
    }
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
