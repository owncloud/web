<template>
  <div>
    <list-loader v-if="loading" />
    <template v-else>
      <no-content-message v-if="isEmpty" id="files-favorites-empty" class="files-empty" icon="star">
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
        :target-route="targetRoute"
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

import { buildResource } from '../helpers/resources'
import Mixins from '../mixins'

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
    ...mapGetters(['user']),

    isSidebarOpen() {
      return this.highlightedFile !== null
    },

    targetRoute() {
      return { name: 'files-personal' }
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
      if (this.uploadProgressVisible) {
        return 190
      }

      return this.selectedFiles.length > 0 ? 110 : 60
    },

    uploadProgressVisible() {
      return this.inProgress.length > 0
    }
  },

  created() {
    this.loadResources()
  },

  methods: {
    ...mapActions('Files', ['setHighlightedFile', 'loadIndicators', 'loadPreviews']),
    ...mapMutations('Files', ['SELECT_RESOURCES', 'LOAD_FILES', 'CLEAR_CURRENT_FILES_LIST']),
    ...mapMutations(['SET_QUOTA']),

    async loadResources() {
      this.loading = true
      this.CLEAR_CURRENT_FILES_LIST()

      let resources = await this.$client.files.getFavoriteFiles(this.davProperties)
      const rootFolder = await this.$client.files.fileInfo('/', this.davProperties)

      resources = resources.map(buildResource)
      this.LOAD_FILES({ currentFolder: buildResource(rootFolder), files: resources })
      this.loadIndicators({ client: this.$client, currentFolder: '/' })
      await this.loadPreviews({
        resources,
        isPublic: this.publicPage(),
        mediaSource: this.mediaSource
      })

      // Load quota
      const user = await this.$client.users.getUser(this.user.id)

      this.SET_QUOTA(user.quota)
      this.loading = false
    }
  }
}
</script>
