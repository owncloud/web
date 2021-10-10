<template>
  <div id="oc-files-context-menu">
    <ul
      v-if="showExternalApps"
      id="oc-files-context-default-actions"
      class="uk-list oc-my-xs oc-files-context-actions"
    >
      <li v-for="(app, index) in appList" :key="`app-${index}`">
        <oc-button
          appearance="raw"
          class="oc-text-bold"
          @click="$_fileActions_openLink(app.name, item.id)"
        >
          <img :src="app.icon" :alt="`Icon for ${app.name} app`" class="oc-icon oc-icon-m" />
          <span class="oc-files-context-action-label">{{ 'Open in ' + app.name }}</span>
        </oc-button>
      </li>
    </ul>
    <hr v-if="showExternalApps" />
    <template v-for="(section, i) in menuSections">
      <ul
        id="`oc-files-context-actions-${section.name}`"
        :key="`section-${section.name}-list`"
        class="uk-list oc-mt-s oc-files-context-actions"
      >
        <li
          v-for="(action, j) in section.items"
          :key="`section-${section.name}-action-${j}`"
          class="oc-files-context-action"
        >
          <component
            :is="action.componentType"
            v-bind="getComponentProps(action, item)"
            :class="['oc-text-bold', action.class]"
            v-on="getComponentListeners(action, item)"
          >
            <oc-icon :name="action.icon" size="medium" />
            <span class="oc-files-context-action-label">{{ action.label(item) }}</span>
            <span
              v-if="action.opensInNewWindow"
              class="oc-invisible-sr"
              v-text="$gettext('(Opens in new window)')"
            />
          </component>
        </li>
      </ul>
      <hr v-if="i < menuSections.length - 1" :key="`section-${section.name}-separator`" />
    </template>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import FileActions from '../../mixins/fileActions'
import AcceptShare from '../../mixins/actions/acceptShare'
import Copy from '../../mixins/actions/copy'
import CreatePublicLink from '../../mixins/actions/createPublicLink'
import DeclineShare from '../../mixins/actions/declineShare'
import Delete from '../../mixins/actions/delete'
import DownloadFile from '../../mixins/actions/downloadFile'
import DownloadFolder from '../../mixins/actions/downloadFolder'
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
  mixins: [
    FileActions,
    AcceptShare,
    Copy,
    CreatePublicLink,
    DeclineShare,
    Delete,
    DownloadFile,
    DownloadFolder,
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
    item: {
      type: Object,
      required: true
    }
  },
  data: () => ({
    appList: []
  }),

  computed: {
    ...mapGetters('Files', ['currentFolder']),

    showExternalApps() {
      return this.item.extension && this.appList?.length > 0
    },

    menuSections() {
      const sections = []
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
        resource: this.item,
        parent: this.currentFolder
      }
    },

    menuItemsContext() {
      const menuItems = []

      // `open` and `open with`
      const openActions = [
        ...this.$_navigate_items,
        ...this.$_fetch_items,
        ...this.$_fileActions_editorActions
      ].filter(item => item.isEnabled(this.filterParams))
      if (openActions.length > 0) {
        menuItems.push(openActions[0])
      }
      if (openActions.length > 1) {
        // TODO: sub nav item with all remaining open actions
      }

      menuItems.push(
        ...[
          ...this.$_downloadFile_items,
          ...this.$_downloadFolder_items,
          ...this.$_createPublicLink_items,
          ...this.$_showShares_items,
          ...this.$_favorite_items.map(action => {
            action.keepOpen = true
            return action
          })
        ].filter(item => item.isEnabled(this.filterParams))
      )

      return menuItems
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
      ].filter(item => item.isEnabled(this.filterParams))
    },

    menuItemsSidebar() {
      return [...this.$_showDetails_items].filter(item => item.isEnabled(this.filterParams))
    }
  },
  mounted() {
    this.loadApps()
  },
  methods: {
    loadApps() {
      this.appList = this.$_fileActions_loadApps(this.item)
    },
    getComponentProps(action, resource) {
      if (action.componentType === 'router-link' && action.route) {
        return {
          to: {
            name: action.route,
            params: {
              item: resource.path
            }
          }
        }
      }

      return {
        appearance: 'raw'
      }
    },

    getComponentListeners(action, resource) {
      if (action.handler === undefined || action.componentType !== 'oc-button') {
        return {}
      }

      const callback = () => action.handler(resource, action.handlerData)
      if (action.keepOpen) {
        return {
          click: event => {
            event.stopPropagation()
            callback()
          }
        }
      }
      return {
        click: callback
      }
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
