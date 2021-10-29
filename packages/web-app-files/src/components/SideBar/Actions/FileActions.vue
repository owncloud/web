<template>
  <ul id="oc-files-actions-sidebar" class="uk-list oc-mt-s">
    <li v-for="(action, index) in actions" :key="`action-${index}`" class="oc-py-xs">
      <component
        :is="action.componentType"
        v-bind="getComponentProps(action, highlightedFile)"
        :class="['oc-text-bold', action.class]"
        @click.stop="action.handler(highlightedFile, action.handlerData)"
      >
        <oc-icon v-if="action.icon" :name="action.icon" size="medium" />
        <oc-img v-if="action.img" :src="action.img" alt="" class="oc-icon oc-icon-m" />
        <span class="oc-files-actions-sidebar-action-label">{{
          action.label(highlightedFile)
        }}</span>
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

import FileActions from '../../../mixins/fileActions'

export default {
  name: 'FileActions',
  title: ($gettext) => {
    return $gettext('Actions')
  },
  mixins: [FileActions],
  computed: {
    ...mapGetters('Files', ['highlightedFile', 'currentFolder']),

    actions() {
      return this.$_fileActions_getAllAvailableActions(this.highlightedFile)
    }
  },
  methods: {
    getComponentProps(action, highlightedFile) {
      if (action.componentType === 'router-link' && action.route) {
        return {
          to: {
            name: action.route,
            params: {
              item: highlightedFile.path
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
#oc-files-actions-sidebar {
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
