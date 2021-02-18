<template>
  <div>
    <list-loader v-if="loading" />
    <template v-else>
      <no-content-message v-if="isEmpty" id="files-public-files-empty" icon="folder">
        <template v-slot:message>
          <span v-translate>There are no resources in this folder</span>
        </template>
        <template v-if="currentFolder.canCreate()" v-slot:callToAction>
          <span v-translate>Drag files and folders here or use the "+ New" button to upload</span>
        </template>
      </no-content-message>
      <oc-table-files
        v-else
        id="files-public-files-table"
        :resources="activeFiles"
        :header-position="headerPosition"
        class="files-table"
        :class="{ 'files-table-squashed': isSidebarOpen }"
        @showDetails="setHighlightedFile"
      />
    </template>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

import ListLoader from '../components/ListLoader.vue'
import NoContentMessage from '../components/NoContentMessage.vue'

export default {
  components: {
    ListLoader,
    NoContentMessage
  },

  data: () => ({
    loading: true
  }),

  computed: {
    ...mapGetters('Files', [
      'publicLinkPassword',
      'activeFiles',
      'davProperties',
      'currentFolder',
      'highlightedFile',
      'inProgress'
    ]),

    isEmpty() {
      return this.activeFiles.length < 1
    },

    isSidebarOpen() {
      return this.highlightedFile !== null
    },

    uploadProgressVisible() {
      return this.inProgress.length > 0
    },

    headerPosition() {
      if (!this.publicPage() && !this.$route.meta.verbose) {
        return 150
      }

      return this.uploadProgressVisible ? 140 : 60
    }
  },

  created() {
    this.loadResources()
  },

  methods: {
    ...mapActions('Files', ['setHighlightedFile', 'loadFiles', 'loadIndicators']),

    async loadResources() {
      this.loading = true

      const resources = await this.$client.publicFiles.list(
        this.$route.params.item,
        this.publicLinkPassword,
        this.davProperties
      )

      this.loadFiles({ currentFolder: resources[0], files: resources.slice(1) })
      this.loading = false
    }
  }
}
</script>
