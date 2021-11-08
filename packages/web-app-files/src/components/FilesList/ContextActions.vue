<template>
  <div id="oc-files-context-menu">
    <template v-for="(section, i) in menuSections">
      <oc-list
        :id="`oc-files-context-actions-${section.name}`"
        :key="`section-${section.name}-list`"
        class="oc-mt-s oc-files-context-actions"
        :class="{ 'oc-my-s': i === menuSections.length - 1 }"
      >
        <action-menu-item
          v-for="(action, j) in section.items"
          :key="`section-${section.name}-action-${j}`"
          :action="action"
          :items="items"
          class="oc-files-context-action"
        />
      </oc-list>
      <hr v-if="i < menuSections.length - 1" :key="`section-${section.name}-separator`" />
    </template>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import ActionMenuItem from '../ActionMenuItem.vue'

import FileActions from '../../mixins/fileActions'
import AcceptShare from '../../mixins/actions/acceptShare'
import Copy from '../../mixins/actions/copy'
import CreatePublicLink from '../../mixins/actions/createPublicLink'
import DeclineShare from '../../mixins/actions/declineShare'
import Delete from '../../mixins/actions/delete'
import DownloadFile from '../../mixins/actions/downloadFile'
import DownloadFolder from '../../mixins/actions/downloadFolder'
import EmptyTrashBin from '../../mixins/actions/emptyTrashBin'
import Favorite from '../../mixins/actions/favorite'
import Move from '../../mixins/actions/move'
import Navigate from '../../mixins/actions/navigate'
import Rename from '../../mixins/actions/rename'
import Restore from '../../mixins/actions/restore'
import ShowActions from '../../mixins/actions/showActions'
import ShowDetails from '../../mixins/actions/showDetails'
import ShowShares from '../../mixins/actions/showShares'

export default {
  name: 'ContextActions',
  components: { ActionMenuItem },
  mixins: [
    FileActions,
    AcceptShare,
    Copy,
    CreatePublicLink,
    DeclineShare,
    Delete,
    DownloadFile,
    DownloadFolder,
    EmptyTrashBin,
    Favorite,
    Move,
    Navigate,
    Rename,
    Restore,
    ShowActions,
    ShowDetails,
    ShowShares
  ],

  props: {
    items: {
      type: Array,
      required: true
    }
  },

  computed: {
    ...mapGetters('Files', ['currentFolder']),

    menuSections() {
      const sections = []

      if (this.items.length > 1) {
        sections.push({
          name: 'batch-actions',
          items: this.menuItemsBatchActions
        })
        return sections
      }

      if (this.menuItemsContext.length) {
        sections.push({
          name: 'context',
          items: this.menuItemsContext
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
        ...this.$_move_items,
        ...this.$_copy_items,
        ...this.$_emptyTrashBin_items,
        ...this.$_restore_items,
        ...this.$_delete_items,
        ...this.$_showActions_items
      ].filter((item) => item.isEnabled(this.filterParams))
    },

    menuItemsContext() {
      const fileHandlers = [
        ...this.$_fileActions_editorActions,
        ...this.$_fileActions_loadExternalAppActions(this.filterParams.resources),
        ...this.$_navigate_items,
        ...this.$_fetch_items
      ]

      return [
        ...fileHandlers,
        ...this.$_downloadFile_items,
        ...this.$_downloadFolder_items,
        ...this.$_createPublicLink_items,
        ...this.$_showShares_items,
        ...this.$_favorite_items.map((action) => {
          action.keepOpen = true
          return action
        })
      ].filter((item) => item.isEnabled(this.filterParams))
    },

    menuItemsActions() {
      return [
        ...this.$_rename_items,
        ...this.$_move_items,
        ...this.$_copy_items,
        ...this.$_restore_items,
        ...this.$_acceptShare_items,
        ...this.$_declineShare_items,
        ...this.$_delete_items,
        ...this.$_showActions_items
      ].filter((item) => item.isEnabled(this.filterParams))
    },

    menuItemsSidebar() {
      return [...this.$_showDetails_items].filter((item) => item.isEnabled(this.filterParams))
    }
  }
}
</script>

<style lang="scss">
.oc-files-context-actions {
  text-align: left;
  white-space: normal;

  > li {
    a,
    a:hover,
    button,
    button:hover {
      text-decoration: none;
      text-align: left;
      color: var(--oc-color-swatch-passive-default);
      display: inline-flex;
      gap: 10px;
      vertical-align: top;
    }
  }
}
</style>
