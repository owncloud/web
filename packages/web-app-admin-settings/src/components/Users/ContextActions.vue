<template>
  <div>
    <context-action-menu :menu-sections="menuSections" :items="items" />
    <quota-modal
      v-if="quotaModalIsOpen"
      :cancel="closeQuotaModal"
      :spaces="drives"
      @space-quota-updated="spaceQuotaUpdated"
    />
  </div>
</template>

<script lang="ts">
import ShowDetails from '../../mixins/showDetails'
import Delete from '../../mixins/users/delete'
import Edit from '../../mixins/users/edit'
import { computed, defineComponent, getCurrentInstance, PropType, unref } from 'vue'
import ContextActionMenu from 'web-pkg/src/components/ContextActions/ContextActionMenu.vue'
import { User } from 'web-client/src/generated'
import QuotaModal from 'web-pkg/src/components/Spaces/QuotaModal.vue'
import EditQuota from 'web-pkg/src/mixins/spaces/editQuota'

export default defineComponent({
  name: 'ContextActions',
  components: { ContextActionMenu, QuotaModal },
  mixins: [Delete, Edit, ShowDetails, EditQuota],
  props: {
    items: {
      type: Array as PropType<User[]>,
      required: true
    }
  },
  watch: {
    items() {
      console.log(1337, this.items)
    }
  },
  setup(props) {
    const instance = getCurrentInstance().proxy as any

    const filterParams = computed(() => ({ resources: props.items }))
    const menuItemsPrimaryActions = computed(() =>
      [...instance.$_edit_items, ...instance.$_delete_items].filter((item) =>
        item.isEnabled(unref(filterParams))
      )
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

    const drives = () => {
      const list = []
      props.items.forEach(u => list.push(u.drive))
      return list
    }

    return {
      menuSections,
      quotaModalIsOpen,
      closeQuotaModal,
      spaceQuotaUpdated,
      drives
    }
  }
})
</script>
