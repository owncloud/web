<template>
  <context-action-menu :menu-sections="menuSections" :items="items" />
</template>

<script lang="ts">
import ContextActionMenu from '../ContextActionMenu.vue'

import FileActions from '../../mixins/fileActions'
import AcceptShare from '../../mixins/actions/acceptShare'
import Copy from '../../mixins/actions/copy'
import CreateQuicklink from '../../mixins/actions/createQuicklink'
import DeclineShare from '../../mixins/actions/declineShare'
import Delete from '../../mixins/actions/delete'
import DownloadArchive from '../../mixins/actions/downloadArchive'
import DownloadFile from '../../mixins/actions/downloadFile'
import EmptyTrashBin from '../../mixins/actions/emptyTrashBin'
import Favorite from '../../mixins/actions/favorite'
import Move from '../../mixins/actions/move'
import Navigate from '../../mixins/actions/navigate'
import Rename from '../../mixins/actions/rename'
import Restore from '../../mixins/actions/restore'
import ShowActions from '../../mixins/actions/showActions'
import ShowDetails from '../../mixins/actions/showDetails'
import ShowShares from '../../mixins/actions/showShares'
import SetSpaceImage from '../../mixins/spaces/actions/setImage'
import SetSpaceReadme from '../../mixins/spaces/actions/setReadme'
import SpaceNavigate from '../../mixins/spaces/actions/navigate'
import { PropType } from '@vue/composition-api'
import { Resource } from '../../helpers/resource'
import ProjectTrashin from '../../mixins/actions/projectTrashbin'

export default {
  name: 'ContextActions',
  components: { ContextActionMenu },
  mixins: [
    FileActions,
    AcceptShare,
    Copy,
    CreateQuicklink,
    DeclineShare,
    Delete,
    DownloadArchive,
    DownloadFile,
    EmptyTrashBin,
    Favorite,
    Move,
    Navigate,
    Rename,
    Restore,
    ShowActions,
    ShowDetails,
    ShowShares,
    SetSpaceImage,
    SetSpaceReadme,
    SpaceNavigate,
    ProjectTrashin
  ],

  props: {
    items: {
      type: Array as PropType<Resource[]>,
      required: true
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

      if (this.menuItemsContext.length) {
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
        ...this.$_restore_items,
        ...this.$_project_trashbin
      ].filter((item) => item.isEnabled(this.filterParams))
    },

    menuItemsContext() {
      const fileHandlers = [
        ...this.$_fileActions_editorActions,
        ...this.$_fileActions_loadExternalAppActions(this.filterParams.resources)
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
        ...this.$_rename_items,
        ...this.$_restore_items,
        ...this.$_acceptShare_items,
        ...this.$_declineShare_items,
        ...this.$_setSpaceImage_items,
        ...this.$_setSpaceReadme_items,
        ...this.$_navigate_space_items,
        ...this.$_project_trashbin
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
        ...this.$_showDetails_items
      ].filter((item) => item.isEnabled(this.filterParams))
    }
  }
}
</script>
