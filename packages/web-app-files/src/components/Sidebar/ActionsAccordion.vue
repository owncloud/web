<template>
  <ul id="oc-files-actions-sidebar" class="uk-list oc-mt-s">
    <li v-for="action in actions" :key="action.label(highlightedFile)" class="oc-py-xs">
      <component
        :is="action.componentType"
        v-bind="getComponentProps(action, highlightedFile)"
        appearance="raw"
        class="oc-text-bold"
        @click.stop="action.handler(highlightedFile, action.handlerData)"
      >
        <oc-icon :name="action.icon" size="medium" />
        {{ action.label(highlightedFile) }}
      </component>
    </li>
  </ul>
</template>

<script>
import { mapGetters } from 'vuex'

import FileActions from '../../mixins/fileActions'

export default {
  name: 'ActionsAccordion',
  title: $gettext => {
    return $gettext('Actions')
  },
  mixins: [FileActions],
  computed: {
    ...mapGetters('Files', ['highlightedFile', 'currentFolder']),

    actions() {
      const actions = this.$_fileActions_editorActions.concat(this.$_fileActions_systemActions)

      return actions.filter(action =>
        action.isEnabled({
          resource: this.highlightedFile,
          parent: this.currentFolder
        })
      )
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

      return {}
    }
  }
}
</script>
