<template>
  <div>
    <list-loader v-if="loading" />
    <template v-else>
      <!-- Pending shares -->

      <div
        v-if="filterDataByStatus(activeFiles, shareStatus.pending).length > 0"
        id="pending-shares"
        class="oc-mb"
      >
        <div class="oc-app-bar shares-bar">
          <h2 v-translate>Pending Shares</h2>
          <div class="oc-ml-s">
            <p>({{ filterDataByStatus(activeFiles, shareStatus.pending).length }})</p>
          </div>
        </div>

        <div id="pending-highlight">
          <oc-table-files
            id="files-shared-with-me-pending-table"
            v-model="selectedPending"
            class="files-table"
            :class="{ 'files-table-squashed': isSidebarOpen }"
            :are-previews-displayed="displayPreviews"
            :resources="
              showAllPending === false
                ? filterDataByStatus(activeFiles, 1).slice(0, 3)
                : filterDataByStatus(activeFiles, 1)
            "
            :target-route="targetRoute"
            :are-resources-clickable="false"
            :highlighted="highlightedFile ? highlightedFile.id : null"
            :has-actions="false"
            :header-position="headerPosition"
          >
            <template v-slot:status="{ resource }">
              <div
                :key="resource.id + resource.status"
                class="uk-text-nowrap uk-flex uk-flex-middle uk-flex-right"
              >
                <oc-button
                  v-if="[shareStatus.declined, shareStatus.pending].includes(resource.status)"
                  v-translate
                  variation="success"
                  size="small"
                  class="file-row-share-status-action"
                  @click.stop="triggerShareAction(resource, 'POST')"
                >
                  Accept
                </oc-button>
                <oc-button
                  v-if="[shareStatus.accepted, shareStatus.pending].includes(resource.status)"
                  v-translate
                  size="small"
                  class="file-row-share-status-action oc-ml"
                  @click.stop="triggerShareAction(resource, 'DELETE')"
                >
                  Decline
                </oc-button>
                <span
                  class="uk-text-small oc-ml file-row-share-status-text uk-text-baseline"
                  v-text="getShareStatusText(resource.status)"
                />
              </div>
            </template>
          </oc-table-files>

          <div
            v-if="
              showAllPending === false &&
                filterDataByStatus(activeFiles, shareStatus.pending).length > 3
            "
            class="oc-app-bar centered"
          >
            <oc-button
              key="show-all-button"
              v-translate
              appearance="raw"
              class="show-hide-pending"
              @click="showAllPending = true"
            >
              Show all</oc-button
            >
          </div>

          <div
            v-else-if="
              showAllPending === true &&
                filterDataByStatus(activeFiles, shareStatus.pending).length > 3
            "
            class="oc-app-bar centered"
          >
            <oc-button
              key="show-less-button"
              v-translate
              appearance="raw"
              class="show-hide-pending"
              @click="showAllPending = false"
            >
              Show less
            </oc-button>
          </div>
        </div>
      </div>
      <br />

      <!-- Accepted shares -->
      <div v-if="!showDeclined">
        <div class="oc-app-bar shares-bar">
          <h2 key="accepted-shares-header" v-translate>Accepted Shares</h2>
          <div
            v-if="filterDataByStatus(activeFiles, shareStatus.accepted).length > 0"
            class="oc-ml-s"
          >
            <p>({{ filterDataByStatus(activeFiles, shareStatus.accepted).length }})</p>
          </div>

          <div class="oc-ml-m">
            <oc-button
              id="show-declined"
              key="show-declined-button"
              v-translate
              appearance="raw"
              @click="showDeclined = true"
              >Show declined shares</oc-button
            >
          </div>
        </div>
        <no-content-message
          v-if="isEmpty || filterDataByStatus(activeFiles, shareStatus.accepted).length === 0"
          id="files-shared-with-me-accepted-empty"
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
          id="files-shared-with-me-accepted-table"
          v-model="selectedAccepted"
          class="files-table"
          :class="{ 'files-table-squashed': isSidebarOpen }"
          :are-previews-displayed="displayPreviews"
          :resources="filterDataByStatus(activeFiles, shareStatus.accepted)"
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
                 v-if="[shareStatus.accepted, shareStatus.pending].includes(resource.status)"
                 v-translate
                 size="small"
                 class="file-row-share-status-action oc-ml"
                 @click.stop="triggerShareAction(resource, 'DELETE')"
               >
                 Decline
               </oc-button>
              <span
                class="uk-text-small oc-ml file-row-share-status-text uk-text-baseline"
                v-text="getShareStatusText(resource.status)"
              />
            </div>
          </template>
        </oc-table-files>
      </div>

      <!-- Declined shares -->
      <div v-else>
        <div class="oc-app-bar shares-bar">
          <h2 key="declined-shares-header" v-translate>Declined Shares</h2>
          <div
            v-if="filterDataByStatus(activeFiles, shareStatus.declined).length > 0"
            class="oc-ml-s"
          >
            <p>({{ filterDataByStatus(activeFiles, shareStatus.declined).length }})</p>
          </div>
          <div class="oc-ml-m">
            <oc-button
              id="show-accepted"
              key="show-accepted-button"
              v-translate
              appearance="raw"
              @click="showDeclined = false"
              >Show accepted shares</oc-button
            >
          </div>
        </div>
        <no-content-message
          v-if="isEmpty || filterDataByStatus(activeFiles, shareStatus.declined).length === 0"
          id="files-shared-with-me-declined-empty"
          class="files-empty"
          icon="group"
        >
          <template #message>
            <span v-translate> No declined shares found </span>
          </template>
        </no-content-message>
        <oc-table-files
          v-else
          id="files-shared-with-me-declined-table"
          v-model="selectedDeclined"
          class="files-table"
          :class="{ 'files-table-squashed': isSidebarOpen }"
          :are-previews-displayed="displayPreviews"
          :resources="filterDataByStatus(activeFiles, shareStatus.declined)"
          :target-route="targetRoute"
          :are-resources-clickable="false"
          :highlighted="highlightedFile ? highlightedFile.id : null"
          :has-actions="false"
          :header-position="headerPosition"
          @fileClick="$_fileActions_triggerDefaultAction"
        >
          <template v-slot:status="{ resource }">
            <div
              :key="resource.id + resource.status"
              class="uk-text-nowrap uk-flex uk-flex-middle uk-flex-right"
            >
              <oc-button
                v-if="[shareStatus.declined, shareStatus.pending].includes(resource.status)"
                v-translate
                size="small"
                class="file-row-share-status-action"
                @click.stop="triggerShareAction(resource, 'POST')"
              >
                Accept
              </oc-button>
              <span
                class="uk-text-small oc-ml file-row-share-status-text uk-text-baseline"
                v-text="getShareStatusText(resource.status)"
              />
            </div>
          </template>
        </oc-table-files>
      </div>
    </template>
  </div>
</template>

<script>
import { mapGetters, mapState, mapActions, mapMutations } from 'vuex'
import { shareStatus } from '../helpers/shareStatus'
import { aggregateResourceShares, buildSharedResource } from '../helpers/resources'
import FileActions from '../mixins/fileActions'
import MixinFilesListPositioning from '../mixins/filesListPositioning'
import MixinFilesListPagination from '../mixins/filesListPagination'

import ListLoader from '../components/FilesList/ListLoader.vue'
import NoContentMessage from '../components/FilesList/NoContentMessage.vue'
import ListInfo from '../components/FilesList/ListInfo.vue'
import { VisibilityObserver } from 'web-pkg/src/observer'
import { ImageDimension, ImageType } from '../constants'
import debounce from 'lodash-es/debounce'

const visibilityObserver = new VisibilityObserver()

export default {
  components: { ListLoader, NoContentMessage, ListInfo },

  mixins: [FileActions, MixinFilesListPositioning, MixinFilesListPagination],

  data: () => ({
    loading: true,
    shareStatus,
    showDeclined: false,
    showAllPending: false
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
      'pages',
      'activeFilesCount'
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
    selectedPending: {
      get() {
        return this.selectedFiles.filter(r => r.status === shareStatus.pending)
      },
      set(resources) {
        resources = resources.filter(r => r.status === shareStatus.pending)
        this.SELECT_RESOURCES(resources)
      }
    },
    selectedAccepted: {
      get() {
        return this.selectedFiles.filter(r => r.status === shareStatus.accepted)
      },
      set(resources) {
        resources = resources.filter(r => r.status === shareStatus.accepted)
        this.SELECT_RESOURCES(resources)
      }
    },
    selectedDeclined: {
      get() {
        return this.selectedFiles.filter(r => r.status === shareStatus.declined)
      },
      set(resources) {
        resources = resources.filter(r => r.status === shareStatus.declined)
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

    displayThumbnails() {
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

  beforeDestroy() {
    visibilityObserver.disconnect()
  },

  methods: {
    ...mapActions('Files', ['setHighlightedFile', 'loadIndicators', 'loadPreview', 'loadAvatars']),
    ...mapActions(['showMessage']),
    ...mapMutations('Files', [
      'LOAD_FILES',
      'SELECT_RESOURCES',
      'CLEAR_CURRENT_FILES_LIST',
      'UPDATE_RESOURCE'
    ]),

    rowMounted(resource, component) {
      const debounced = debounce(({ unobserve }) => {
        unobserve()
        this.loadAvatars({ resource })

        if (!this.displayThumbnails) {
          return
        }

        this.loadPreview({
          resource,
          isPublic: false,
          dimensions: ImageDimension.Thumbnail,
          type: ImageType.Thumbnail
        })
      }, 250)

      visibilityObserver.observe(component.$el, {
        onEnter: debounced,
        onExit: debounced.cancel
      })
    },
    filterDataByStatus(data, status) {
      return data.filter(item => item.status === status)
    },
    async loadResources() {
      this.loading = true
      this.CLEAR_CURRENT_FILES_LIST()

      let resources = await this.$client.requests.ocs({
        service: 'apps/files_sharing',
        action: '/api/v1/shares?format=json&shared_with_me=true&state=all&include_tags=false',
        method: 'GET'
      })

      resources = await resources.json()
      resources = resources.ocs.data

      if (resources.length) {
        resources = aggregateResourceShares(
          resources,
          true,
          !this.isOcis,
          this.configuration.server,
          this.getToken
        )
      }

      this.LOAD_FILES({ currentFolder: null, files: resources })

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
        this.loadResources()
        this.showMessage({
          title: this.$gettext('Error while changing share state'),
          desc: error.message,
          status: 'danger',
          autoClose: {
            enabled: true
          }
        })
      }
    }
  }
}
</script>

<style>
.centered {
  display: flex;
  flex-direction: row;
  justify-content: center;
}
.shares-bar {
  display: flex;
  flex-direction: row;
  align-items: baseline;
}
#pending-highlight {
  background-color: var(--oc-color-background-highlight);
}
.show-hide-pending {
  text-align: center;
}
</style>
