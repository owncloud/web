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
import { useSpaceActionsEditQuota } from 'web-pkg/src/composables/actions/spaces'
import { SpaceResource } from 'web-client/src'
import { useCapabilitySpacesMaxQuota, useStore } from 'web-pkg/src/composables'
import { SpaceActionOptions } from 'web-pkg/src/composables/actions'

export default defineComponent({
  name: 'ContextActions',
  components: { ContextActionMenu, QuotaModal },
  mixins: [Delete, Edit, ShowDetails],
  props: {
    items: {
      type: Array as PropType<User[]>,
      required: true
    }
  },
  setup(props) {
    const instance = getCurrentInstance().proxy as any
    const store = useStore()
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

    const {
      actions: editQuotaActions,
      modalOpen: quotaModalIsOpen,
      closeModal: closeQuotaModal,
      spaceQuotaUpdated
    } = useSpaceActionsEditQuota({ store })

    const menuItemsPrimaryActions = computed(() =>
      [...instance.$_edit_items, ...instance.$_delete_items].filter((item) =>
        item.isEnabled(unref(filterParams))
      )
    )
    const menuItemsSecondaryActions = computed(() =>
      [...unref(editQuotaActions)].filter((item) =>
        // Why does this work at all? Edit Quota is a space action and props.items is of type User[]
        item.isEnabled(unref(filterParams) as SpaceActionOptions)
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
