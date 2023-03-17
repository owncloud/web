<template>
  <div>
    <context-action-menu :menu-sections="menuSections" :action-options="actionOptions" />
  </div>
</template>

<script lang="ts">
import ShowDetails from '../../mixins/showDetails'
import Delete from '../../mixins/groups/delete'
import { computed, defineComponent, getCurrentInstance, PropType, unref } from 'vue'
import ContextActionMenu from 'web-pkg/src/components/ContextActions/ContextActionMenu.vue'
import { GroupActionOptions } from 'web-pkg/src/composables/actions'

export default defineComponent({
  name: 'ContextActions',
  components: { ContextActionMenu },
  mixins: [Delete, ShowDetails],
  props: {
    actionOptions: {
      type: Object as PropType<GroupActionOptions>,
      required: true
    }
  },
  setup(props) {
    const instance = getCurrentInstance().proxy as any

    const menuItemsPrimaryActions = computed(() =>
      [...instance.$_delete_items].filter((item) => item.isEnabled(props.actionOptions))
    )

    const menuItemsSidebar = computed(() =>
      [...instance.$_showDetails_items].filter((item) => item.isEnabled(props.actionOptions))
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
