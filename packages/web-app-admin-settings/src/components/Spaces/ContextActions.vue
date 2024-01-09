<template>
  <div>
    <context-action-menu :menu-sections="menuSections" :action-options="{ resources: items }" />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, unref } from 'vue'
import { SpaceResource } from '@ownclouders/web-client'
import { ContextActionMenu } from '@ownclouders/web-pkg'
import { useStore } from '@ownclouders/web-pkg'

import {
  useSpaceActionsDelete,
  useSpaceActionsDisable,
  useSpaceActionsEditDescription,
  useSpaceActionsEditQuota,
  useSpaceActionsRename,
  useSpaceActionsRestore,
  useActionsShowDetails
} from '@ownclouders/web-pkg'

export default defineComponent({
  name: 'ContextActions',
  components: { ContextActionMenu },
  props: {
    items: {
      type: Array as PropType<SpaceResource[]>,
      required: true
    }
  },
  setup(props) {
    const store = useStore()
    const filterParams = computed(() => ({ resources: props.items }))

    const { actions: deleteActions } = useSpaceActionsDelete({ store })
    const { actions: disableActions } = useSpaceActionsDisable({ store })
    const { actions: editQuotaActions } = useSpaceActionsEditQuota()
    const { actions: editDescriptionActions } = useSpaceActionsEditDescription({ store })
    const { actions: renameActions } = useSpaceActionsRename({ store })
    const { actions: restoreActions } = useSpaceActionsRestore({ store })
    const { actions: showDetailsActions } = useActionsShowDetails()

    const menuItemsPrimaryActions = computed(() =>
      [...unref(renameActions), ...unref(editDescriptionActions)].filter((item) =>
        item.isEnabled(unref(filterParams))
      )
    )
    const menuItemsSecondaryActions = computed(() =>
      [
        ...unref(editQuotaActions),
        ...unref(disableActions),
        ...unref(restoreActions),
        ...unref(deleteActions)
      ].filter((item) => item.isEnabled(unref(filterParams)))
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
      menuSections
    }
  }
})
</script>
