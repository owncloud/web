<template>
  <div>
    <oc-table-files
      :resources="activeFiles"
      :target-route="$route.name"
      :highlighted="highlightedFile ? highlightedFile.id : null"
      @showDetails="highlightResource"
    >
      <template v-slot:quickActions="{ resource }">
        <quick-actions :item="resource" :actions="app.quickActions" />
      </template>
      <template v-slot:status="{ resource }">
        <div
          :key="resource.id + resource.status"
          class="uk-text-nowrap uk-flex uk-flex-middle uk-flex-right"
        >
          <oc-button
            v-if="resource.status === 1 || resource.status === 2"
            variation="raw"
            class="file-row-share-status-action uk-text-meta"
            @click="pendingShareAction(item, 'POST')"
          >
            <translate>Accept</translate>
          </oc-button>
          <oc-button
            v-if="resource.status === 1 || resource.status === 0"
            variation="raw"
            class="file-row-share-status-action uk-text-meta oc-ml"
            @click="pendingShareAction(resource, 'DELETE')"
          >
            <translate>Decline</translate>
          </oc-button>
          <span
            class="uk-text-small oc-ml file-row-share-status-text uk-text-baseline"
            v-text="shareStatus(resource.status)"
          />
        </div>
      </template>
    </oc-table-files>
  </div>
</template>

<script>
import { mapGetters, mapState, mapActions, mapMutations } from 'vuex'

import { aggregateResourceShares, buildResource } from '../helpers/resources'

import QuickActions from '../components/FilesLists/QuickActions.vue'

export default {
  components: { QuickActions },

  computed: {
    ...mapState(['app']),
    ...mapGetters('Files', ['davProperties', 'highlightedFile', 'activeFiles']),
    ...mapGetters(['isOcis', 'configuration', 'getToken'])
  },

  created() {
    this.loadResources()
  },

  methods: {
    ...mapActions('Files', ['setHighlightedFile', 'loadIndicators']),
    ...mapMutations('Files', ['LOAD_FILES']),

    async loadResources() {
      let resources = await this.$client.requests.ocs({
        service: 'apps/files_sharing',
        action: '/api/v1/shares?format=json&shared_with_me=true&state=all&include_tags=false',
        method: 'GET'
      })
      let rootFolder = await this.$client.files.fileInfo('/', this.davProperties)

      resources = await resources.json()
      resources = resources.ocs.data
      resources = await aggregateResourceShares(
        resources,
        true,
        !this.isOcis,
        this.configuration.server,
        this.getToken
      )
      rootFolder = buildResource(rootFolder)

      this.LOAD_FILES({ currentFolder: rootFolder, files: resources })
      this.loadIndicators({ client: this.$client, currentFolder: '/' })
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
