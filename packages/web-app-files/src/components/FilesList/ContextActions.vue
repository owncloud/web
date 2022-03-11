<template>
  <div id="oc-files-context-menu">
    <template v-for="(section, sectionIndex) in menuSections">
      <oc-list
        :id="`oc-files-context-actions-${section.name}`"
        :key="`section-${section.name}-list`"
        class="oc-files-context-actions"
        :class="getSectionClasses(sectionIndex)"
      >
        <action-menu-item
          v-for="(action, actionIndex) in section.items"
          :key="`section-${section.name}-action-${actionIndex}`"
          :action="action"
          :items="items"
          class="oc-files-context-action oc-px-s oc-rounded"
        />
      </oc-list>
    </template>
  </div>
</template>

<script>
import ActionMenuItem from '../ActionMenuItem.vue'

import FileActions from '../../mixins/fileActions'
import AcceptShare from '../../mixins/actions/acceptShare'
import Copy from '../../mixins/actions/copy'
import CreatePublicLink from '../../mixins/actions/createPublicLink'
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
    SetSpaceReadme
  ],

  props: {
    items: {
      type: Array,
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
        ...this.$_restore_items
      ].filter((item) => item.isEnabled(this.filterParams))
    },

    menuItemsContext() {
      const fileHandlers = [
        ...this.$_fileActions_editorActions,
        ...this.$_fileActions_loadExternalAppActions(this.filterParams.resources),
        ...this.$_fetch_items
      ]

      return [...fileHandlers].filter((item) => item.isEnabled(this.filterParams))
    },

    menuItemsShare() {
      return [...this.$_showShares_items, ...this.$_createPublicLink_items].filter((item) =>
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
        ...this.$_setSpaceReadme_items
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
  },
  methods: {
    getSectionClasses(index) {
      const classes = []
      if (!this.menuSections.length) {
        return classes
      }
      if (index < this.menuSections.length - 1) {
        classes.push('oc-pb-s')
      }
      if (index > 0) {
        classes.push('oc-pt-s')
      }
      if (index < this.menuSections.length - 1) {
        classes.push('oc-files-context-actions-border')
      }
      return classes
    }
  }
}
</script>

<style lang="scss">
.oc-files-context-actions {
  text-align: left;
  white-space: normal;

  > li {
    &:hover {
      background-color: var(--oc-color-background-hover);
    }

    a,
    button,
    span {
      color: var(--oc-color-swatch-passive-default) !important;
      display: inline-flex;
      font-weight: normal !important;
      gap: 10px;
      justify-content: flex-start;
      vertical-align: top;
      width: 100%;
      text-align: left;

      &:hover {
        color: var(--oc-color-swatch-passive-default);
        text-decoration: none !important;
      }
    }
  }

  &-border {
    border-bottom: 1px solid var(--oc-color-border);
  }
}
</style>
