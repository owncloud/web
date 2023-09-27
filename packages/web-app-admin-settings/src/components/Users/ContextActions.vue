<template>
  <div>
    <context-action-menu :menu-sections="menuSections" :action-options="{ resources: items }" />
    <quota-modal
      v-if="quotaModalIsOpen"
      :cancel="closeQuotaModal"
      :spaces="selectedPersonalDrives"
      :max-quota="maxQuota"
      :warning-message="quotaModalWarningMessage"
      :warning-message-contextual-helper-data="quotaWarningMessageContextualHelperData"
      resource-type="user"
    />
  </div>
</template>

<script lang="ts">
import {
  useUserActionsEdit,
  useUserActionsDelete,
  useUserActionsEditQuota
} from '../../composables/actions/users'
import { computed, defineComponent, PropType, unref, watch, toRaw, ref } from 'vue'
import { ContextActionMenu } from '@ownclouders/web-pkg'
import { User } from 'web-client/src/generated'
import { QuotaModal } from '@ownclouders/web-pkg'
import { SpaceResource } from 'web-client/src'
import { useCapabilitySpacesMaxQuota, useStore } from '@ownclouders/web-pkg'
import { useActionsShowDetails } from '@ownclouders/web-pkg'
import { isPersonalSpaceResource } from 'web-client/src/helpers'
import { useGettext } from 'vue3-gettext'

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
    const store = useStore()
    const { $gettext } = useGettext()
    const filterParams = computed(() => ({ resources: props.items }))
    const selectedPersonalDrives = ref([])
    watch(
      () => props.items,
      () => {
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

    const usersWithoutDrive = computed(() => {
      return props.items.filter(({ drive }) => !isPersonalSpaceResource(drive as SpaceResource))
    })

    const quotaModalWarningMessage = computed(() => {
      return usersWithoutDrive.value.length
        ? $gettext('Quota will only be applied to users who logged in at least once.')
        : ''
    })

    const quotaWarningMessageContextualHelperData = computed(() => {
      return usersWithoutDrive.value.length
        ? {
            title: $gettext('Unaffected users'),
            text: [...usersWithoutDrive.value]
              .sort((u1, u2) => u1.displayName.localeCompare(u2.displayName))
              .map((user) => user.displayName)
              .join(', ')
          }
        : {}
    })

    const { actions: showDetailsActions } = useActionsShowDetails()
    const {
      actions: editQuotaActions,
      modalOpen: quotaModalIsOpen,
      closeModal: closeQuotaModal
    } = useUserActionsEditQuota()
    const { actions: userEditActions } = useUserActionsEdit()
    const { actions: userDeleteActions } = useUserActionsDelete({ store })

    const menuItemsPrimaryActions = computed(() =>
      [...unref(userEditActions), ...unref(userDeleteActions)].filter((item) =>
        item.isEnabled(unref(filterParams))
      )
    )
    const menuItemsSecondaryActions = computed(() =>
      [...unref(editQuotaActions)].filter((item) => item.isEnabled(unref(filterParams)))
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
      selectedPersonalDrives,
      quotaModalWarningMessage,
      quotaWarningMessageContextualHelperData
    }
  }
})
</script>
