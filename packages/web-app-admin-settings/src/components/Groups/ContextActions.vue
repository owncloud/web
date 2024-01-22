<template>
  <div>
    <context-action-menu :menu-sections="menuSections" :action-options="actionOptions" />
  </div>
</template>

<script lang="ts">
import { useActionsShowDetails } from '@ownclouders/web-pkg'
import { computed, defineComponent, PropType, unref } from 'vue'
import { ContextActionMenu } from '@ownclouders/web-pkg'
import { GroupActionOptions } from '@ownclouders/web-pkg'
import { useGroupActionsEdit, useGroupActionsDelete } from '../../composables/actions/groups'

export default defineComponent({
  name: 'ContextActions',
  components: { ContextActionMenu },
  props: {
    actionOptions: {
      type: Object as PropType<GroupActionOptions>,
      required: true
    }
  },
  setup(props) {
    const { actions: showDetailsActions } = useActionsShowDetails()
    const { actions: deleteActions } = useGroupActionsDelete()
    const { actions: editActions } = useGroupActionsEdit()

    const menuItemsPrimaryActions = computed(() =>
      [...unref(editActions), ...unref(deleteActions)].filter((item) =>
        item.isEnabled(props.actionOptions)
      )
    )

    const menuItemsSidebar = computed(() =>
      [...unref(showDetailsActions)].filter((item) => item.isEnabled(props.actionOptions))
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

    return {
      menuSections
    }
  }
})
</script>
