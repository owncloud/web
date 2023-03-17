<template>
  <div>
    <context-action-menu :menu-sections="menuSections" :action-options="{ resources: items }" />
    <quota-modal
      v-if="quotaModalIsOpen"
      :cancel="closeQuotaModal"
      :spaces="selectedPersonalDrives"
      :max-quota="maxQuota"
      resource-type="user"
      @space-quota-updated="spaceQuotaUpdated"
    />
  </div>
</template>

<script lang="ts">
import ShowDetails from '../../mixins/showDetails'
import Delete from '../../mixins/users/delete'
import Edit from '../../mixins/users/edit'
import {
  computed,
  defineComponent,
  getCurrentInstance,
  PropType,
  unref,
  watch,
  toRaw,
  ref
} from 'vue'
import ContextActionMenu from 'web-pkg/src/components/ContextActions/ContextActionMenu.vue'
import { User } from 'web-client/src/generated'
import QuotaModal from 'web-pkg/src/components/Spaces/QuotaModal.vue'
import EditQuota from 'web-pkg/src/mixins/spaces/editQuota'
import { SpaceResource } from 'web-client/src'
import { useCapabilitySpacesMaxQuota } from 'web-pkg/src/composables'

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
  setup(props) {
    const instance = getCurrentInstance().proxy as any
    const filterParams = computed(() => ({ resources: props.items }))
    const selectedPersonalDrives = ref([])
    watch(
      () => props.items,
      async () => {
        selectedPersonalDrives.value.splice(0, unref(selectedPersonalDrives).length)
        props.items.forEach((user) => {
          const drive = toRaw(user.drive)
          if (drive === undefined || drive.id === undefined) {
            return
          }
          const spaceResource = {
            id: drive.id,
            name: user.displayName,
            spaceQuota: drive.quota
          } as SpaceResource
          selectedPersonalDrives.value.push(spaceResource)
        })
      },
      { deep: true, immediate: true }
    )
    const menuItemsPrimaryActions = computed(() =>
      [...instance.$_edit_items, ...instance.$_delete_items].filter((item) =>
        item.isEnabled(unref(filterParams))
      )
    )
    const menuItemsSecondaryActions = computed(() =>
      [...instance.$_editQuota_items].filter((item) => item.isEnabled(unref(filterParams)))
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
      spaceQuotaUpdated,
      selectedPersonalDrives
    }
  }
})
</script>
