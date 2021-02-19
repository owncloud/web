<template>
  <div>
    <list-loader v-if="loading" />
    <template v-else>
      <not-found-message v-if="folderNotFound" class="uk-height-1-1" />
      <no-content-message v-else-if="isEmpty" id="files-personal-empty" icon="folder">
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
import NotFoundMessage from '../components/FilesLists/NotFoundMessage.vue'

export default {
  components: { QuickActions, ListLoader, NoContentMessage, NotFoundMessage },

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
      'inProgress',
      'currentFolder'
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
    },

    folderNotFound() {
      return this.currentFolder === null
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
    ...mapMutations('Files', ['SELECT_RESOURCES', 'SET_CURRENT_FOLDER']),

    async loadResources() {
      this.loading = true

      try {
        const resources = await this.$client.files.list(
          this.$route.params.item || '/',
          1,
          this.davProperties
        )

        this.loadFiles({ currentFolder: resources[0], files: resources.slice(1) })
        this.loadIndicators({ client: this.$client, currentFolder: this.$route.params.item || '/' })
      } catch (error) {
        this.SET_CURRENT_FOLDER(null)
        console.error(error)
      }

      this.loading = false
    },

    highlightResource(resource) {
      this.setHighlightedFile(resource)
    }
  }
}
</script>
