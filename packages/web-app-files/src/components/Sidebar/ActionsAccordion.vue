<template>
  <ul id="oc-files-actions-sidebar" class="uk-list oc-mt-s">
    <li v-for="action in actions" :key="action.ariaLabel(highlightedFile)" class="oc-py-xs">
      <component
        :is="getComponentType(action)"
        v-bind="getComponentProps(action)"
        :aria-Label="action.ariaLabel(highlightedFile)"
        appearance="raw"
        class="oc-text-bold"
        @click.stop="action.handler(highlightedFile, action.handlerData)"
      >
        <oc-icon :name="action.icon" size="medium" />
        {{ action.ariaLabel(highlightedFile) }}
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
    getComponentType(action) {
      if (action.componentType) {
        return action.componentType
      }

      return 'oc-button'
    },
    getComponentProps(action) {
      const route = action.getRoute()
      if (action.componentType === 'router-link' && route) {
        return {
          to: route
        }
      }

      return {}
    }
  }
}
</script>
