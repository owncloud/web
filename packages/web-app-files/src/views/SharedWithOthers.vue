<template>
  <div>
    <list-loader v-if="loading" />
    <template v-else>
      <no-content-message v-if="isEmpty" icon="group">
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
        :target-route="$route.name"
        :highlighted="highlightedFile ? highlightedFile.id : null"
        @showDetails="highlightResource"
      >
        <template v-slot:quickActions="{ resource }">
          <quick-actions :item="resource" :actions="app.quickActions" />
        </template>
      </oc-table-files>
    </template>
  </div>
</template>

<script>
import { mapGetters, mapState, mapActions, mapMutations } from 'vuex'

import { aggregateResourceShares, buildResource } from '../helpers/resources'

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
    ...mapGetters(['isOcis', 'configuration', 'getToken']),

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
    }
  },

  created() {
    this.loadResources()
  },

  methods: {
    ...mapActions('Files', ['setHighlightedFile', 'loadIndicators']),
    ...mapMutations('Files', ['LOAD_FILES', 'SELECT_RESOURCES']),

    async loadResources() {
      this.loading = true

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
      this.loading = false
    },

    highlightResource(resource) {
      this.setHighlightedFile(resource)
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
    }
  }
}
</script>
