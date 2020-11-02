<template>
  <ul class="uk-list oc-mt-s">
    <li v-for="action in actions" :key="action.ariaLabel(highlightedFile)" class="oc-py-xs">
      <oc-button
        :aria-Label="action.ariaLabel(highlightedFile)"
        variation="raw"
        color="text"
        class="oc-text-bold"
        @click.stop="action.handler(highlightedFile, action.handlerData)"
      >
        <oc-icon :name="action.icon" aria-hidden="true" size="medium" />
        {{ action.ariaLabel(highlightedFile) }}
      </oc-button>
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
  }
}
</script>
