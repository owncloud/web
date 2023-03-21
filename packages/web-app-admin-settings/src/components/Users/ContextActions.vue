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
import { useUserActionsEdit, useUserActionsDelete } from '../../composables/actions/users'
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
import { SpaceActionOptions, useActionsShowDetails } from 'web-pkg/src/composables/actions'

export default defineComponent({
  name: 'ContextActions',
  components: { ContextActionMenu, QuotaModal },
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

    const { actions: showDetailsActions } = useActionsShowDetails()
    const {
      actions: editQuotaActions,
      modalOpen: quotaModalIsOpen,
      closeModal: closeQuotaModal,
      spaceQuotaUpdated
    } = useSpaceActionsEditQuota({ store })
    const { actions: userEditActions } = useUserActionsEdit()
    const { actions: userDeleteActions } = useUserActionsDelete({ store })

    const menuItemsPrimaryActions = computed(() =>
      [...unref(userEditActions), ...unref(userDeleteActions)].filter((item) =>
        item.isEnabled(unref(filterParams))
      )
    )
    const menuItemsSecondaryActions = computed(() =>
      [...unref(editQuotaActions)].filter((item) =>
        // TODO: create separate useUserActionsEditQuota
        item.isEnabled(unref(filterParams) as SpaceActionOptions)
      )
    )

    const menuItemsSidebar = computed(() =>
      [...unref(showDetailsActions)].filter((item) => item.isEnabled(unref(filterParams)))
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
