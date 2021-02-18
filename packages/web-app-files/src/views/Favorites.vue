<template>
  <div>
    <list-loader v-if="loading" />
    <template v-else>
      <no-content-message v-if="isEmpty" icon="star">
        <template #message>
          <span v-translate>There are no resources marked as favorite</span>
        </template>
      </no-content-message>
      <oc-table-files
        v-else
        id="files-favorites-table"
        v-model="selected"
        class="files-table"
        :class="{ 'files-table-squashed': isSidebarOpen }"
        :resources="activeFiles"
        :target-route="$route.name"
        :highlighted="highlightedFile ? highlightedFile.id : null"
        :header-position="headerPosition"
        @showDetails="setHighlightedFile"
      >
        <template v-slot:quickActions="props">
          <quick-actions :item="props.resource" :actions="app.quickActions" />
        </template>
      </oc-table-files>
    </template>
  </div>
</template>

<script>
import { mapGetters, mapState, mapActions, mapMutations } from 'vuex'

import QuickActions from '../components/FilesLists/QuickActions.vue'
import ListLoader from '../components/ListLoader.vue'
import NoContentMessage from '../components/NoContentMessage.vue'

export default {
  components: { QuickActions, ListLoader, NoContentMessage },

  data: () => ({
    loading: true
  }),

  computed: {
    ...mapState(['app']),
    ...mapGetters('Files', ['davProperties', 'highlightedFile', 'activeFiles', 'selectedFiles']),

    isSidebarOpen() {
      return this.highlightedFile !== null
    },

    selected: {
      get() {
        return this.selectedFiles
      },
      set(resources) {
        this.SELECT_RESOURCES(resources)
      }
    },

    isEmpty() {
      return this.activeFiles.length < 1
    },

    headerPosition() {
      return this.selectedFiles.length > 0 ? 112 : 60
    }
  },

  created() {
    this.loadResources()
  },

  methods: {
    ...mapActions('Files', ['setHighlightedFile', 'loadFiles', 'loadIndicators']),
    ...mapMutations('Files', ['SELECT_RESOURCES']),

    async loadResources() {
      this.loading = true

      const resources = await this.$client.files.getFavoriteFiles(this.davProperties)
      const rootFolder = await this.$client.files.fileInfo('/', this.davProperties)

      this.loadFiles({ currentFolder: rootFolder, files: resources })
      this.loadIndicators({ client: this.$client, currentFolder: '/' })
      this.loading = false
    }
  }
}
</script>
