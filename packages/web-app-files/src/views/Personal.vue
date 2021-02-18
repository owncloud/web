<template>
  <div>
    <list-loader v-if="loading" />
    <template v-else>
      <no-content-message v-if="isEmpty" icon="folder">
        <template v-slot:message>
          <span v-translate>There are no resources in this folder</span>
        </template>
        <template v-slot:callToAction>
          <span v-translate>Drag files and folders here or use the "+ New" button to upload</span>
        </template>
      </no-content-message>
      <oc-table-files
        v-else
        id="files-personal-table"
        v-model="selected"
        class="files-table"
        :class="{ 'files-table-squashed': isSidebarOpen }"
        :resources="activeFiles"
        :target-route="targetRoute"
        :highlighted="highlightedFile ? highlightedFile.id : null"
        :header-position="headerPosition"
        @showDetails="highlightResource"
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
    ...mapGetters('Files', [
      'davProperties',
      'highlightedFile',
      'activeFiles',
      'selectedFiles',
      'inProgress'
    ]),

    isSidebarOpen() {
      return this.highlightedFile !== null
    },

    targetRoute() {
      return this.$route.path.replace(/[%2F]*$/, '')
    },

    isEmpty() {
      return this.activeFiles.length < 1
    },

    uploadProgressVisible() {
      return this.inProgress.length > 0
    },

    headerPosition() {
      return this.uploadProgressVisible ? 230 : 150
    },

    selected: {
      get() {
        return this.selectedFiles
      },
      set(resources) {
        this.SELECT_RESOURCES(resources)
      }
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
    ...mapMutations('Files', ['SELECT_RESOURCES']),

    async loadResources() {
      this.loading = true

      const resources = await this.$client.files.list(
        this.$route.params.item || '/',
        1,
        this.davProperties
      )

      this.loadFiles({ currentFolder: resources[0], files: resources.slice(1) })
      this.loadIndicators({ client: this.$client, currentFolder: this.$route.params.item || '/' })
      this.loading = false
    },

    highlightResource(resource) {
      this.setHighlightedFile(resource)
    }
  }
}
</script>
