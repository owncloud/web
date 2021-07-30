<template>
  <ul id="oc-files-context-actions" class="uk-list oc-mt-s">
    <template v-for="(section, i) in menuSections">
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
      <hr v-if="i < menuSections.length - 1" :key="`section-${section.name}-separator`" />
    </template>
  </ul>
</template>

<script>
import { mapGetters } from 'vuex'

import FileActions from '../../mixins/fileActions'
import Copy from '../../mixins/actions/copy'
import CreatePublicLink from '../../mixins/actions/createPublicLink'
import Delete from '../../mixins/actions/delete'
import Download from '../../mixins/actions/download'
import Favorite from '../../mixins/actions/favorite'
import Move from '../../mixins/actions/move'
import Navigate from '../../mixins/actions/navigate'
import Rename from '../../mixins/actions/rename'
import ShowActions from '../../mixins/actions/showActions'
import ShowDetails from '../../mixins/actions/showDetails'
import ShowShares from '../../mixins/actions/showShares'

export default {
  name: 'ContextActions',
  mixins: [
    FileActions,
    Copy,
    CreatePublicLink,
    Delete,
    Download,
    Favorite,
    Move,
    Navigate,
    Rename,
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

  computed: {
    ...mapGetters('Files', ['currentFolder']),

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
          ...this.$_download_items,
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
        ...this.$_delete_items,
        ...this.$_showActions_items
      ].filter(item => item.isEnabled(this.filterParams))
    },

    menuItemsSidebar() {
      return [...this.$_showDetails_items].filter(item => item.isEnabled(this.filterParams))
    }
  },
  methods: {
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
#oc-files-context-actions {
  text-align: left;

  > li a,
  > li a:hover {
    text-decoration: none;
    color: var(--oc-color-swatch-passive-default);
    display: inline-flex;
    gap: 10px;
    vertical-align: top;
  }
}
</style>
