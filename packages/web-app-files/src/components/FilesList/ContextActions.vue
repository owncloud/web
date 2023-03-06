<template>
  <context-action-menu :menu-sections="menuSections" :items="items" :space="space" />
</template>

<script lang="ts">
import ContextActionMenu from 'web-pkg/src/components/ContextActions/ContextActionMenu.vue'

import FileActions from '../../mixins/fileActions'
import CreateQuicklink from '../../mixins/actions/createQuicklink'
import EmptyTrashBin from '../../mixins/actions/emptyTrashBin'
import Paste from '../../mixins/actions/paste'
import ShowActions from '../../mixins/actions/showActions'
import { useShowDetails } from '../../mixins/actions/showDetails'
import ShowShares from '../../mixins/actions/showShares'
import SetSpaceImage from '../../mixins/spaces/actions/setImage'
import SetSpaceReadme from 'web-pkg/src/mixins/spaces/setReadme'
import { computed, getCurrentInstance, PropType, unref } from 'vue'
import { Resource } from 'web-client'
import { SpaceResource } from 'web-client/src/helpers'

export default {
  name: 'ContextActions',
  components: { ContextActionMenu },
  mixins: [
    FileActions,
    CreateQuicklink,
    EmptyTrashBin,
    Paste,
    ShowActions,
    ShowShares,
    SetSpaceImage,
    SetSpaceReadme
  ],

  props: {
    space: {
      type: Object as PropType<SpaceResource>,
      required: true
    },
    items: {
      type: Array as PropType<Resource[]>,
      required: true
    }
  },

  setup(props) {
    const instance = getCurrentInstance().proxy as any

    const { actions: showDetailsItems } = useShowDetails()

    const filterParams = computed(() => {
      return {
        space: props.space,
        resources: props.items
      }
    })

    const menuItemsBatchActions = computed(() =>
      [
        ...instance.$_acceptShare_items,
        ...instance.$_declineShare_items,
        ...instance.$_downloadArchive_items,
        ...instance.$_delete_items,
        ...instance.$_move_items,
        ...instance.$_copy_items,
        ...instance.$_emptyTrashBin_items,
        ...instance.$_restore_items
      ].filter((item) => item.isEnabled(unref(filterParams)))
    )

    const menuItemsContext = computed(() => {
      const fileHandlers = [
        ...instance.$_fileActions_editorActions,
        ...instance.$_fileActions_loadExternalAppActions(unref(filterParams))
      ]

      return [...fileHandlers]
        .filter((item) => item.isEnabled(unref(filterParams)))
        .sort((x, y) => Number(y.canBeDefault) - Number(x.canBeDefault))
    })

    const menuItemsShare = computed(() => {
      return [...instance.$_showShares_items, ...instance.$_createQuicklink_items].filter((item) =>
        item.isEnabled(unref(filterParams))
      )
    })

    const menuItemsActions = computed(() => {
      return [
        ...this.$_downloadArchive_items,
        ...this.$_downloadFile_items,
        ...this.$_delete_items,
        ...this.$_move_items,
        ...this.$_copy_items,
        ...this.$_paste_items,
        ...this.$_rename_items,
        ...this.$_showEditTags_items,
        ...this.$_restore_items,
        ...this.$_acceptShare_items,
        ...this.$_declineShare_items,
        ...this.$_setSpaceImage_items,
        ...this.$_setSpaceReadme_items
      ].filter((item) => item.isEnabled(this.filterParams))
    }

    const menuItemsSidebar = computed(() => {
      const fileHandlers = [...instance.$_navigate_items]

      return [
        ...instance.$_favorite_items.map((action) => {
          action.keepOpen = true
          return action
        }),
        ...fileHandlers,
        ...unref(showDetailsItems)
      ].filter((item) => item.isEnabled(unref(filterParams)))
    })

    const menuSections = computed(() => {
      const sections = []
      if (props.items.length > 1) {
        if (unref(menuItemsBatchActions).length) {
          sections.push({
            name: 'batch-actions',
            items: [...unref(menuItemsBatchActions)]
          })
        }
        sections.push({
          name: 'batch-details',
          items: [...unref(showDetailsItems)]
        })
        return sections
      }

      if (unref(menuItemsContext).length) {
        sections.push({
          name: 'context',
          items: unref(menuItemsContext)
        })
      }
      if (unref(menuItemsShare).length) {
        sections.push({
          name: 'share',
          items: unref(menuItemsShare)
        })
      }
      if (unref(menuItemsActions).length) {
        sections.push({
          name: 'actions',
          items: unref(menuItemsActions)
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
}
</script>
