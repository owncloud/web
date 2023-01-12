<template>
  <div>
    <context-action-menu :menu-sections="menuSections" :items="items" />
    <quota-modal
      v-if="quotaModalIsOpen"
      :cancel="closeQuotaModal"
      :space="quotaModalSelectedSpace"
      @spaceQuotaUpdated="spaceQuotaUpdated"
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
import { computed, defineComponent, getCurrentInstance, PropType, unref } from 'vue'
import { Resource } from 'web-client'
import ContextActionMenu from 'web-pkg/src/components/ContextActions/ContextActionMenu.vue'
import QuotaModal from 'web-pkg/src/components/Spaces/QuotaModal.vue'

export default defineComponent({
  name: 'ContextActions',
  components: { ContextActionMenu, QuotaModal },
  mixins: [Delete, Disable, EditDescription, EditQuota, Rename, Restore],

  props: {
    items: {
      type: Array as PropType<Resource[]>,
      required: true
    }
  },

  setup(props) {
    const instance = getCurrentInstance().proxy

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

      return sections
    })

    const quotaModalSelectedSpace = computed(() => instance.$data.$_editQuota_selectedSpace)
    const quotaModalIsOpen = computed(() => instance.$data.$_editQuota_modalOpen)
    const closeQuotaModal = () => {
      instance.$_editQuota_closeModal()
    }
    const spaceQuotaUpdated = (quota) => {
      instance.$data.$_editQuota_selectedSpace.spaceQuota = quota
    }

    return {
      menuSections,
      quotaModalSelectedSpace,
      quotaModalIsOpen,
      closeQuotaModal,
      spaceQuotaUpdated
    }
  }
})
</script>
