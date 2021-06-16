<template>
  <div>
    <list-loader v-if="loading" />
    <template v-else>
      <no-content-message
        v-if="isEmpty"
        id="files-shared-with-me-empty"
        class="files-empty"
        icon="group"
      >
        <template #message>
          <span v-translate>
            You are currently not collaborating on other people's resources
          </span>
        </template>
      </no-content-message>
      <oc-table-files
        v-else
        id="files-shared-with-me-table"
        v-model="selected"
        class="files-table"
        :class="{ 'files-table-squashed': isSidebarOpen }"
        :are-previews-displayed="displayPreviews"
        :resources="activeFiles"
        :target-route="targetRoute"
        :highlighted="highlightedFile ? highlightedFile.id : null"
        :header-position="headerPosition"
        @showDetails="setHighlightedFile"
        @fileClick="$_fileActions_triggerDefaultAction"
      >
        <template v-slot:status="{ resource }">
          <div
            :key="resource.id + resource.status"
            class="uk-text-nowrap uk-flex uk-flex-middle uk-flex-right"
          >
            <oc-button
              v-if="[shareStatus.pending, shareStatus.declined].includes(resource.status)"
              size="small"
              class="file-row-share-status-action"
              @click.stop="triggerShareAction(resource, 'POST')"
            >
              <translate>Accept</translate>
            </oc-button>
            <oc-button
              v-if="[shareStatus.pending, shareStatus.accepted].includes(resource.status)"
              size="small"
              class="file-row-share-status-action oc-ml-s"
              @click.stop="triggerShareAction(resource, 'DELETE')"
            >
              <translate>Decline</translate>
            </oc-button>
            <span
              class="uk-text-small oc-ml file-row-share-status-text uk-text-baseline"
              v-text="getShareStatusText(resource.status)"
            />
          </div>
        </template>
        <template #footer>
          <oc-pagination
            v-if="paginationLength > 1"
            :pages="paginationLength"
            :current-page="currentPage"
            :max-displayed="3"
            :current-route="$_filesListPagination_targetRoute"
            class="files-pagination uk-flex uk-flex-center oc-my-s"
          />
          <list-info
            v-if="activeFiles.length > 0"
            class="uk-width-1-1 oc-my-s"
            :files="totalFilesCount.files"
            :folders="totalFilesCount.folders"
          />
        </template>
      </oc-table-files>
    </template>
  </div>
</template>

<script>
import { mapGetters, mapState, mapActions, mapMutations } from 'vuex'
import { shareStatus } from '../helpers/shareStatus'
import { aggregateResourceShares, buildResource, buildSharedResource } from '../helpers/resources'
import FileActions from '../mixins/fileActions'
import MixinFilesListPositioning from '../mixins/filesListPositioning'
import MixinFilesListPagination from '../mixins/filesListPagination'

import ListLoader from '../components/ListLoader.vue'
import NoContentMessage from '../components/NoContentMessage.vue'
import ListInfo from '../components/FilesListFooterInfo.vue'

export default {
  components: { ListLoader, NoContentMessage, ListInfo },

  mixins: [FileActions, MixinFilesListPositioning, MixinFilesListPagination],

  data: () => ({
    loading: true,
    shareStatus
  }),

  computed: {
    ...mapState(['app']),
    ...mapState('Files', ['currentPage', 'files']),
    ...mapGetters('Files', [
      'davProperties',
      'highlightedFile',
      'activeFiles',
      'selectedFiles',
      'inProgress',
      'totalFilesCount',
      'paginationLength'
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

    targetRoute() {
      return { name: 'files-personal' }
    },

    displayPreviews() {
      return !this.configuration.options.disablePreviews
    }
  },

  watch: {
    uploadProgressVisible() {
      this.adjustTableHeaderPosition()
    },
    $route: {
      handler: '$_filesListPagination_updateCurrentPage',
      immediate: true
    }
  },

  created() {
    this.loadResources()
    window.onresize = this.adjustTableHeaderPosition
  },

  mounted() {
    this.adjustTableHeaderPosition()
  },

  methods: {
    ...mapActions('Files', ['setHighlightedFile', 'loadIndicators', 'loadPreviews']),
    ...mapActions(['showMessage']),
    ...mapMutations('Files', [
      'LOAD_FILES',
      'SELECT_RESOURCES',
      'CLEAR_CURRENT_FILES_LIST',
      'UPDATE_RESOURCE'
    ]),
    ...mapMutations(['SET_QUOTA']),

    async loadResources() {
      this.loading = true
      this.CLEAR_CURRENT_FILES_LIST()

      let resources = await this.$client.requests.ocs({
        service: 'apps/files_sharing',
        action: '/api/v1/shares?format=json&shared_with_me=true&state=all&include_tags=false',
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

      resources = aggregateResourceShares(
        resources,
        true,
        !this.isOcis,
        this.configuration.server,
        this.getToken,
        this.$client,
        this.UPDATE_RESOURCE
      )

      this.LOAD_FILES({ currentFolder: rootFolder, files: resources })

      if (this.displayPreviews) {
        await this.loadPreviews({
          resources,
          isPublic: false,
          mediaSource: this.mediaSource,
          encodePath: this.encodePath,
          headers: this.requestHeaders
        })
      }

      // Load quota
      const user = await this.$client.users.getUser(this.user.id)

      this.SET_QUOTA(user.quota)
      this.loading = false
    },

    getShareStatusText(status) {
      switch (status) {
        case shareStatus.accepted:
          return this.$gettext('Accepted')
        case shareStatus.declined:
          return this.$gettext('Declined')
        case shareStatus.pending:
        default:
          return this.$gettext('Pending')
      }
    },

    async triggerShareAction(resource, type) {
      try {
        // exec share action
        let response = await this.$client.requests.ocs({
          service: 'apps/files_sharing',
          action: `api/v1/shares/pending/${resource.share.id}`,
          method: type
        })

        // exit on failure
        if (response.status !== 200) {
          throw new Error(response.statusText)
        }
        // get updated share from response or re-fetch it
        let share = null
        // oc10
        if (parseInt(response.headers.get('content-length')) > 0) {
          response = await response.json()

          if (response.ocs.data.length > 0) {
            share = response.ocs.data[0]
          }
        } else {
          // ocis
          const { shareInfo } = await this.$client.shares.getShare(resource.share.id)
          share = shareInfo
        }

        // update share in store
        if (share) {
          const sharedResource = await buildSharedResource(
            share,
            true,
            !this.isOcis,
            this.configuration.server,
            this.getToken
          )
          this.UPDATE_RESOURCE(sharedResource)
        }
      } catch (error) {
        this.showMessage({
          title: this.$gettext('Error while changing share state'),
          desc: error.message,
          status: 'danger'
        })
      }
    }
  }
}
</script>
