<template>
  <div>
    <list-loader v-if="loading" />
    <template v-else>
      <no-content-message
        v-if="isEmpty"
        id="files-shared-with-others-empty"
        class="files-empty"
        icon="group"
      >
        <template #message>
          <span v-translate>
            You are currently not collaborating on any of your resources with other people
          </span>
        </template>
      </no-content-message>
      <oc-table-files
        v-else
        id="files-shared-with-others-table"
        v-model="selected"
        class="files-table"
        :class="{ 'files-table-squashed': isSidebarOpen }"
        :resources="activeFiles"
        :target-route="targetRoute"
        :highlighted="highlightedFile ? highlightedFile.id : null"
        :header-position="headerPosition"
        @showDetails="setHighlightedFile"
        @fileClick="$_fileActions_triggerDefaultAction"
      >
        <template v-slot:quickActions="{ resource }">
          <quick-actions class="oc-visible@s" :item="resource" :actions="app.quickActions" />
        </template>
        <template #footer>
          <div
            v-if="activeFilesCount.folders > 0 || activeFilesCount.files > 0"
            class="uk-text-nowrap uk-text-meta uk-text-center uk-width-1-1"
          >
            <span id="files-list-count-folders" v-text="activeFilesCount.folders" />
            <translate :translate-n="activeFilesCount.folders" translate-plural="folders"
              >folder</translate
            >
            <translate>and</translate>
            <span id="files-list-count-files" v-text="activeFilesCount.files" />
            <translate :translate-n="activeFilesCount.files" translate-plural="files"
              >file</translate
            >
            <template v-if="activeFiles.length > 0">
              &ndash; {{ getResourceSize(filesTotalSize) }}
            </template>
          </div>
        </template>
      </oc-table-files>
    </template>
  </div>
</template>

<script>
import { mapGetters, mapState, mapActions, mapMutations } from 'vuex'

import { aggregateResourceShares, buildResource, getResourceSize } from '../helpers/resources'
import FileActions from '../mixins/fileActions'

import QuickActions from '../components/FilesLists/QuickActions.vue'
import ListLoader from '../components/ListLoader.vue'
import NoContentMessage from '../components/NoContentMessage.vue'

export default {
  components: { QuickActions, ListLoader, NoContentMessage },

  mixins: [FileActions],

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
      'activeFilesCount',
      'filesTotalSize'
    ]),
    ...mapGetters(['isOcis', 'configuration', 'getToken', 'user']),

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

    isSidebarOpen() {
      return this.highlightedFile !== null
    },

    uploadProgressVisible() {
      return this.inProgress.length > 0
    },

    headerPosition() {
      if (this.uploadProgressVisible) {
        return 190
      }

      return this.selectedFiles.length > 0 ? 110 : 60
    },

    targetRoute() {
      return { name: 'files-personal' }
    }
  },

  created() {
    this.loadResources()
  },

  methods: {
    ...mapActions('Files', ['setHighlightedFile', 'loadIndicators', 'loadPreviews']),
    ...mapMutations('Files', ['LOAD_FILES', 'SELECT_RESOURCES', 'CLEAR_CURRENT_FILES_LIST']),
    ...mapMutations(['SET_QUOTA']),

    async loadResources() {
      this.loading = true
      this.CLEAR_CURRENT_FILES_LIST()

      let resources = await this.$client.requests.ocs({
        service: 'apps/files_sharing',
        action: '/api/v1/shares?format=json&reshares=true&include_tags=false',
        method: 'GET'
      })
      let rootFolder = await this.$client.files.fileInfo('/', this.davProperties)

      resources = await resources.json()
      resources = resources.ocs.data
      rootFolder = buildResource(rootFolder)

      if (resources.length < 1) {
        this.LOAD_FILES({ currentFolder: rootFolder, files: [] })
        this.loading = false

        return
      }

      resources = await aggregateResourceShares(
        resources,
        false,
        !this.isOcis,
        this.configuration.server,
        this.getToken
      )

      this.LOAD_FILES({ currentFolder: rootFolder, files: resources })
      this.loadIndicators({ client: this.$client, currentFolder: '/' })
      await this.loadPreviews({
        resources,
        isPublic: this.publicPage(),
        mediaSource: this.mediaSource,
        headers: this.requestHeaders
      })

      // Load quota
      const user = await this.$client.users.getUser(this.user.id)

      this.SET_QUOTA(user.quota)
      this.loading = false
    },

    shareStatus(status) {
      if (status === 0) {
        return this.$gettext('Accepted')
      }
      if (status === 1) {
        return this.$gettext('Pending')
      }
      if (status === 2) {
        return this.$gettext('Declined')
      }
    },

    getResourceSize(size) {
      return getResourceSize(size)
    }
  }
}
</script>
