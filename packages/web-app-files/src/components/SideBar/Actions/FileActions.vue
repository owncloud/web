<template>
  <div>
    <ul
      v-if="highlightedFile.extension && appList.length > 0"
      id="oc-files-actions-sidebar"
      class="uk-list oc-mt-s"
    >
      <li v-for="(app, index) in appList" :key="`app-${index}`" class="oc-py-xs pointer">
        <div :class="['oc-text-bold']" @click="openLink(app)">
          <img :src="app.icon" :alt="app.name" class="oc-icon-m" />
          <span class="oc-files-actions-sidebar-action-label">{{ 'Open in ' + app.name }}</span>
        </div>
      </li>
    </ul>
    <ul id="oc-files-actions-sidebar" class="uk-list oc-mt-s oc-files-actions-sidebar-actions">
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
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import FileActions from '../../../mixins/fileActions'
export default {
  name: 'ActionsAccordion',
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
  watch: {
    highlightedFile(val, oldVal) {
      // is triggered whenever the store state changes
      this.loadApps()
    }
  },
  created() {
    this.loadApps()
  },
  methods: {
    openLink(app) {
      this.$_fileActions_openLink(app, this.highlightedFile)
    },
    async loadApps() {
      return await this.$_fileActions_loadApps(this.highlightedFile)
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
.pointer {
  cursor: pointer;
}
.oc-files-actions-sidebar-actions {
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
