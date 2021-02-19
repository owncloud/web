<template>
  <div>
    <list-loader v-if="loading" />
    <template v-else>
      <not-found-message v-if="folderNotFound" class="uk-height-1-1" />
      <no-content-message v-else-if="isEmpty" id="files-public-files-empty" icon="folder">
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
        target-route="/public/list"
        class="files-table"
        :class="{ 'files-table-squashed': isSidebarOpen }"
        @showDetails="setHighlightedFile"
      />
    </template>
  </div>
</template>

<script>
import { mapGetters, mapActions, mapMutations } from 'vuex'

import ListLoader from '../components/ListLoader.vue'
import NoContentMessage from '../components/NoContentMessage.vue'
import NotFoundMessage from '../components/FilesLists/NotFoundMessage.vue'

export default {
  components: {
    ListLoader,
    NoContentMessage,
    NotFoundMessage
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
    },

    folderNotFound() {
      return this.currentFolder === null
    }
  },

  created() {
    this.loadResources()
  },

  methods: {
    ...mapActions('Files', ['setHighlightedFile', 'loadFiles', 'loadIndicators']),
    ...mapMutations('Files', ['SET_CURRENT_FOLDER']),

    async loadResources() {
      this.loading = true

      try {
        const resources = await this.$client.publicFiles.list(
          this.$route.params.item,
          this.publicLinkPassword,
          this.davProperties
        )

        this.loadFiles({ currentFolder: resources[0], files: resources.slice(1) })
      } catch (error) {
        this.SET_CURRENT_FOLDER(null)
        console.error(error)
      }

      this.loading = false
    }
  }
}
</script>
