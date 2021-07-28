<template>
  <ul id="oc-files-context-actions" class="uk-list oc-mt-s">
    <li v-for="(action, index) in menuItems" :key="`action-${index}`" class="oc-py-xs">
      <component
        :is="action.componentType"
        v-bind="getComponentProps(action, item)"
        :class="['oc-text-bold', action.class]"
        @click.stop="action.handler(item, action.handlerData)"
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
</template>

<script>
import { mapGetters } from 'vuex'

import FileActions from '../../mixins/fileActions'
import Copy from './../../mixins/actions/copy'
import Delete from './../../mixins/actions/delete'
import Download from '../../mixins/actions/download'
import Favorite from '../../mixins/actions/favorite'
import Move from './../../mixins/actions/move'
import Navigate from '../../mixins/actions/navigate'
import Rename from './../../mixins/actions/rename'

export default {
  name: 'ContextActions',
  mixins: [FileActions, Copy, Delete, Download, Favorite, Move, Navigate, Rename],

  props: {
    item: {
      type: Object,
      required: true
    }
  },

  computed: {
    ...mapGetters('Files', ['currentFolder']),

    menuItems() {
      const filterParams = {
        resource: this.item,
        parent: this.currentFolder
      }
      const menuItems = []

      // `open` and `open with`
      const openActions = [
        ...this.$_navigate_items.filter(item => item.isEnabled(filterParams)),
        ...this.$_fetch_items.filter(item => item.isEnabled(filterParams)),
        ...this.$_fileActions_editorActions.filter(item => item.isEnabled(filterParams))
      ]
      if (openActions.length > 0) {
        menuItems.push(openActions[0])
      }
      if (openActions.length > 1) {
        // TODO: sub nav item with all remaining open actions
      }

      // other actions
      menuItems.push(
        ...this.$_download_items.filter(item => item.isEnabled(filterParams)),
        // create & copy public link
        // share
        ...this.$_favorite_items.filter(item => item.isEnabled(filterParams)),
        ...this.$_rename_items.filter(item => item.isEnabled(filterParams)),
        ...this.$_move_items.filter(item => item.isEnabled(filterParams)),
        ...this.$_copy_items.filter(item => item.isEnabled(filterParams)),
        ...this.$_delete_items.filter(item => item.isEnabled(filterParams))
        // all actions
        // details
      )

      return menuItems
    }
  },
  methods: {
    getComponentProps(action, target) {
      if (action.componentType === 'router-link' && action.route) {
        return {
          to: {
            name: action.route,
            params: {
              item: target.path
            }
          }
        }
      }

      return {
        appearance: 'raw'
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
