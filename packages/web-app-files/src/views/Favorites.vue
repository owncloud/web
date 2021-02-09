<template>
  <!-- <oc-table-files
    :class="isSidebarOpen ? 'files-table-squashed' : 'files-table'"
    :resources="activeFiles"
    :target-route="$route.name"
    :highlighted="highlightedFile ? highlightedFile.id : null"
    @showDetails="highlightResource"
  >
    <template v-slot:quickActions="props">
      <quick-actions :item="props.resource" :actions="app.quickActions" />
    </template>
  </oc-table-files> -->
  <div>Hello world</div>
</template>

<script>
import { mapGetters, mapState, mapActions } from 'vuex'

import QuickActions from '../components/FilesLists/QuickActions.vue'

export default {
  components: { QuickActions },

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
      const resources = await this.$client.files.list(
        this.$route.params.item,
        1,
        this.davProperties
      )

      this.loadFiles({ currentFolder: resources[0], files: resources.slice(1) })
      this.loadIndicators({ client: this.$client, currentFolder: this.$route.params.item })
    },

    highlightResource(resource) {
      this.setHighlightedFile(resource)
    }
  }
}
</script>

<style scoped>
.files-table {
  width: 100%;
}

.files-app-bar-squashed,
.files-table-squashed {
  width: calc(100% - 400px);
}
</style>
