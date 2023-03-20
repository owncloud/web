<template>
  <div>
    <context-action-menu :menu-sections="menuSections" :action-options="{ resources: items }" />
    <quota-modal
      v-if="quotaModalIsOpen"
      :cancel="closeQuotaModal"
      :spaces="items"
      :max-quota="maxQuota"
      @space-quota-updated="spaceQuotaUpdated"
    />
  </div>
</template>

<script lang="ts">
import Delete from 'web-pkg/src/mixins/spaces/delete'
import Disable from 'web-pkg/src/mixins/spaces/disable'
import EditDescription from 'web-pkg/src/mixins/spaces/editDescription'
import EditQuota from 'web-pkg/src/mixins/spaces/editQuota'
import Rename from 'web-pkg/src/mixins/spaces/rename'
import Restore from 'web-pkg/src/mixins/spaces/restore'
import ShowDetails from '../../mixins/showDetails'
import { computed, defineComponent, getCurrentInstance, PropType, unref } from 'vue'
import { SpaceResource } from 'web-client'
import ContextActionMenu from 'web-pkg/src/components/ContextActions/ContextActionMenu.vue'
import QuotaModal from 'web-pkg/src/components/Spaces/QuotaModal.vue'
import { useCapabilitySpacesMaxQuota } from 'web-pkg/src/composables'

export default defineComponent({
  name: 'ContextActions',
  components: { ContextActionMenu, QuotaModal },
  mixins: [Delete, Disable, EditDescription, EditQuota, Rename, Restore, ShowDetails],
  props: {
    items: {
      type: Array as PropType<SpaceResource[]>,
      required: true
    }
  },
  setup(props) {
    const instance = getCurrentInstance().proxy as any

    const filterParams = computed(() => ({ resources: props.items }))
    const menuItemsPrimaryActions = computed(() =>
      [...instance.$_rename_items, ...instance.$_editDescription_items].filter((item) =>
        item.isEnabled(unref(filterParams))
      )
    )
    const menuItemsSecondaryActions = computed(() =>
      [
        ...instance.$_editQuota_items,
        ...instance.$_disable_items,
        ...instance.$_restore_items,
        ...instance.$_delete_items
      ].filter((item) => item.isEnabled(unref(filterParams)))
    )
    const menuItemsSidebar = computed(() =>
      [...instance.$_showDetails_items].filter((item) => item.isEnabled(unref(filterParams)))
    )

    const menuSections = computed(() => {
      const sections = []

      if (unref(menuItemsPrimaryActions).length) {
        sections.push({
          name: 'primaryActions',
          items: unref(menuItemsPrimaryActions)
        })
      }
      if (unref(menuItemsSecondaryActions).length) {
        sections.push({
          name: 'secondaryActions',
          items: unref(menuItemsSecondaryActions)
        })
      }
      if (unref(menuItemsSidebar).length) {
        sections.push({
          name: 'sidebar',
          items: unref(menuItemsSidebar)
        })
      }
      return sections
    })
    const quotaModalIsOpen = computed(() => instance.$data.$_editQuota_modalOpen)
    const closeQuotaModal = () => {
      instance.$_editQuota_closeModal()
    }
    const spaceQuotaUpdated = (quota) => {
      instance.$data.$_editQuota_selectedSpace.spaceQuota = quota
    }
    return {
      maxQuota: useCapabilitySpacesMaxQuota(),
      menuSections,
      quotaModalIsOpen,
      closeQuotaModal,
      spaceQuotaUpdated
    }
  }
})
</script>
