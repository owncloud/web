<template>
  <div>
    <list-loader v-if="state === 'loading'" />
    <oc-table-files
      v-else-if="state === 'loaded'"
      :resources="activeFiles"
      :target-route="$route.name"
      :highlighted="highlightedFile ? highlightedFile.id : null"
      @showDetails="highlightResource"
    >
      <template v-slot:quickActions="{ resource }">
        <quick-actions :item="resource" :actions="app.quickActions" />
      </template>
    </oc-table-files>
    <no-content-message v-else-if="state === 'empty'" icon="group">
      <template #message>
        <span v-translate>
          You are currently not collaborating on any of your resources with other people
        </span>
      </template>
    </no-content-message>
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
    state: 'loading'
  }),

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
      this.state = 'loading'

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
        this.state = 'empty'

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
      this.state = 'loaded'
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
