<template>
  <ul id="oc-files-actions-sidebar" class="uk-list oc-mt-s">
    <li v-for="(app, index) in appList" :key="`app-${index}`" class="oc-py-xs">
      <oc-button
        appearance="raw"
        class="oc-text-bold"
        @click="$_fileActions_openLink(app.name, highlightedFile.fileId)"
      >
        <!-- why img and not oc-icon again? -->
        <img :src="app.icon" :alt="`Icon for ${app.name} app`" class="oc-icon oc-icon-m" />
        <span class="oc-files-actions-sidebar-action-label">{{ 'Open in ' + app.name }}</span>
      </oc-button>
    </li>
    <li v-for="(action, index) in actions" :key="`action-${index}`" class="oc-py-xs">
      <component
        :is="action.componentType"
        v-bind="getComponentProps(action, highlightedFile)"
        :class="['oc-text-bold', action.class]"
        @click.stop="action.handler(highlightedFile, action.handlerData)"
      >
        <oc-icon :name="action.icon" size="medium" />
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
  title: $gettext => {
    return $gettext('Actions')
  },
  mixins: [FileActions],
  data: () => ({
    appList: []
  }),
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
  mounted() {
    this.loadApps()
  },
  methods: {
    loadApps() {
      this.appList = this.$_fileActions_loadApps(this.highlightedFile)
    },
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
