<template>
  <div>
    <list-loader v-if="state === 'loading'" />
    <oc-table-files
      v-else-if="state === 'loaded'"
      id="files-table"
      :resources="activeFiles"
      :target-route="$route.path"
      :highlighted="highlightedFile ? highlightedFile.id : null"
      @showDetails="highlightResource"
    >
      <template v-slot:quickActions="props">
        <quick-actions :item="props.resource" :actions="app.quickActions" />
      </template>
    </oc-table-files>
    <no-content-message v-else-if="state === 'empty'" icon="folder">
      <template v-slot:message>
        <span v-translate>There are no resources in this folder</span>
      </template>
      <template v-slot:callToAction>
        <span v-translate>Drag files and folders here or use the "+ New" button to upload</span>
      </template>
    </no-content-message>
  </div>
</template>

<script>
import { mapGetters, mapState, mapActions } from 'vuex'

import QuickActions from '../components/FilesLists/QuickActions.vue'
import ListLoader from '../components/ListLoader.vue'
import NoContentMessage from '../components/NoContentMessage.vue'

export default {
  components: { QuickActions, ListLoader, NoContentMessage },

  data: () => ({
    state: 'loading'
  }),

  computed: {
    ...mapState(['app']),
    ...mapGetters('Files', ['davProperties', 'highlightedFile', 'activeFiles']),

    isSidebarOpen() {
      return this.highlightedFile !== null
    }
  },

  watch: {
    $route: {
      handler: 'loadResources',
      immediate: true
    }
  },

  methods: {
    ...mapActions('Files', ['setHighlightedFile', 'loadFiles', 'loadIndicators']),

    async loadResources() {
      this.state = 'loading'

      const resources = await this.$client.files.list(
        this.$route.params.item || '/',
        1,
        this.davProperties
      )

      this.loadFiles({ currentFolder: resources[0], files: resources.slice(1) })
      this.loadIndicators({ client: this.$client, currentFolder: this.$route.params.item || '/' })

      if (resources.length === 1) {
        this.state = 'empty'

        return
      }

      this.state = 'loaded'
    },

    highlightResource(resource) {
      this.setHighlightedFile(resource)
    }
  }
}
</script>

<style>
#files-table .oc-table-header-cell {
  top: 150px;
}
</style>
