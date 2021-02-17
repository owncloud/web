<template>
  <div>
    <list-loader v-if="state === 'loading'" />
    <oc-table-files
      v-if="state === 'loaded'"
      id="files-favorites-table"
      :resources="activeFiles"
      :target-route="$route.name"
      :highlighted="highlightedFile ? highlightedFile.id : null"
      @showDetails="highlightResource"
    >
      <template v-slot:quickActions="props">
        <quick-actions :item="props.resource" :actions="app.quickActions" />
      </template>
    </oc-table-files>
    <no-content-message v-else-if="state === 'empty'" icon="star">
      <template #message>
        <span v-translate>There are no resources marked as favorite</span>
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

  created() {
    this.loadResources()
  },

  methods: {
    ...mapActions('Files', ['setHighlightedFile', 'loadFiles', 'loadIndicators']),

    async loadResources() {
      this.state = 'loading'

      const resources = await this.$client.files.getFavoriteFiles(this.davProperties)
      const rootFolder = await this.$client.files.fileInfo('/', this.davProperties)

      this.loadFiles({ currentFolder: rootFolder, files: resources })

      if (resources.length < 1) {
        this.state = 'empty'

        return
      }

      this.loadIndicators({ client: this.$client, currentFolder: '/' })
      this.state = 'loaded'
    },

    highlightResource(resource) {
      this.setHighlightedFile(resource)
    }
  }
}
</script>
