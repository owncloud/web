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
import ShowDetails from '../../mixins/actions/showDetails'
import ShowShares from '../../mixins/actions/showShares'
import SetSpaceImage from '../../mixins/spaces/actions/setImage'
import SetSpaceReadme from 'web-pkg/src/mixins/spaces/setReadme'
import SpaceNavigate from 'web-pkg/src/mixins/spaces/navigate'
import { PropType } from 'vue'
import { Resource } from 'web-client'
import { SpaceResource } from 'web-client/src/helpers'
import DeletedFiles from 'web-pkg/src/mixins/spaces/deletedFiles'

export default {
  name: 'ContextActions',
  components: { ContextActionMenu },
  mixins: [
    FileActions,
    DeletedFiles,
    CreateQuicklink,
    EmptyTrashBin,
    Paste,
    ShowActions,
    ShowDetails,
    ShowShares,
    SetSpaceImage,
    SetSpaceReadme,
    SpaceNavigate
  ],

  props: {
    space: {
      type: Object as PropType<SpaceResource>,
      required: true
    },
    items: {
      type: Array as PropType<Resource[]>,
      required: true
    },
    deactivateApps: {
      type: Boolean,
      required: false,
      default: false
    }
  },

  computed: {
    menuSections() {
      const sections = []
      if (this.items.length > 1) {
        if (this.menuItemsBatchActions.length) {
          sections.push({
            name: 'batch-actions',
            items: [...this.menuItemsBatchActions]
          })
        }
        sections.push({
          name: 'batch-details',
          items: [...this.$_showDetails_items]
        })
        return sections
      }

      if (this.menuItemsContext.length && !this.deactivateApps) {
        sections.push({
          name: 'context',
          items: this.menuItemsContext
        })
      }
      if (this.menuItemsShare.length) {
        sections.push({
          name: 'share',
          items: this.menuItemsShare
        })
      }
      if (this.menuItemsActions.length) {
        sections.push({
          name: 'actions',
          items: this.menuItemsActions
        })
      }
      if (this.menuItemsSidebar.length) {
        sections.push({
          name: 'sidebar',
          items: this.menuItemsSidebar
        })
      }
      return sections
    },

    filterParams() {
      return {
        space: this.space,
        resources: this.items
      }
    },

    menuItemsBatchActions() {
      return [
        ...this.$_acceptShare_items,
        ...this.$_declineShare_items,
        ...this.$_downloadArchive_items,
        ...this.$_delete_items,
        ...this.$_move_items,
        ...this.$_copy_items,
        ...this.$_emptyTrashBin_items,
        ...this.$_restore_items
      ].filter((item) => item.isEnabled(this.filterParams))
    },

    menuItemsContext() {
      const fileHandlers = [
        ...this.$_fileActions_editorActions,
        ...this.$_fileActions_loadExternalAppActions(this.filterParams)
      ]

      return [...fileHandlers]
        .filter((item) => item.isEnabled(this.filterParams))
        .sort((x, y) => Number(y.canBeDefault) - Number(x.canBeDefault))
    },

    menuItemsShare() {
      return [...this.$_showShares_items, ...this.$_createQuicklink_items].filter((item) =>
        item.isEnabled(this.filterParams)
      )
    },

    menuItemsActions() {
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
        ...this.$_setSpaceReadme_items,
        ...this.$_navigate_space_items
      ].filter((item) => item.isEnabled(this.filterParams))
    },

    menuItemsSidebar() {
      const fileHandlers = [...this.$_navigate_items]

      return [
        ...this.$_favorite_items.map((action) => {
          action.keepOpen = true
          return action
        }),
        ...fileHandlers,
        ...this.$_deletedFiles_items_generic,
        ...this.$_showDetails_items
      ].filter((item) => item.isEnabled(this.filterParams))
    }
  }
}
</script>
