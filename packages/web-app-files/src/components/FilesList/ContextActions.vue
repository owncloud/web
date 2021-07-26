<template>
  <ul id="oc-files-context-actions" class="uk-list oc-mt-s">
    <li v-for="(action, index) in filteredActions" :key="`action-${index}`" class="oc-py-xs">
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

export default {
  name: 'ContextActions',
  mixins: [FileActions],

  props: {
    item: {
      type: Object,
      required: true
    }
  },

  computed: {
    ...mapGetters('Files', ['currentFolder']),

    filteredActions() {
      const actions = this.$_fileActions_editorActions.concat(this.$_fileActions_systemActions)

      return actions.filter(action =>
        action.isEnabled({
          resource: this.item,
          parent: this.currentFolder
        })
      )
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
