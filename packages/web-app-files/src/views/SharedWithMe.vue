<template>
  <div>
    <list-loader v-if="loading" />
    <template v-else>
      <!-- Pending shares -->
      <div v-if="hasPending">
        <div class="shares-header">
          <h2>{{ pendingTitle }}</h2>
          <span>({{ pendingCount }})</span>
        </div>

        <div id="pending-highlight">
          <oc-table-files
            id="files-shared-with-me-pending-table"
            v-model="pendingSelected"
            class="files-table"
            :class="{ 'files-table-squashed': !sidebarClosed }"
            :are-thumbnails-displayed="displayThumbnails"
            :resources="showMorePending ? pending : pending.slice(0, 3)"
            :target-route="targetRoute"
            :are-resources-clickable="false"
            :has-actions="false"
            :header-position="headerPosition"
          >
            <template #status="{ resource }">
              <div
                :key="resource.id + resource.status"
                class="uk-text-nowrap uk-flex uk-flex-middle uk-flex-right"
              >
                <oc-button
                  size="small"
                  class="file-row-share-status-action"
                  @click.stop="$_acceptShare_trigger(resource)"
                >
                  <oc-icon size="small" name="check" />
                  <translate>Accept</translate>
                </oc-button>
                <oc-button
                  size="small"
                  class="file-row-share-status-action oc-ml-s"
                  @click.stop="$_declineShare_trigger(resource)"
                >
                  <oc-icon size="small" name="not_interested" />
                  <translate>Decline</translate>
                </oc-button>
              </div>
            </template>
            <template #contextMenu="{ resource }">
              <context-actions :item="resource" />
            </template>
            <template v-if="pendingHasMore" #footer>
              <div class="uk-width-1-1">
                <oc-button appearance="raw" class="uk-text-center" @click="togglePendingShowMore">
                  {{ pendingToggleMoreLabel }}
                </oc-button>
              </div>
            </template>
          </oc-table-files>
        </div>
      </div>

      <!-- Accepted or declined shares -->
      <div>
        <div class="shares-header">
          <h2>{{ sharesTitle }}</h2>
          <span v-if="hasShares">({{ sharesCount }})</span>
          <oc-button id="toggle-view-mode" appearance="raw" @click="toggleSharesViewMode">{{
            sharesToggleLabel
          }}</oc-button>
        </div>

        <no-content-message
          v-if="!hasShares"
          id="files-shared-with-me-shares-empty"
          class="files-empty"
          icon="group"
        >
          <template #message>
            <span>{{ sharesEmptyMessage }}</span>
          </template>
        </no-content-message>
        <oc-table-files
          v-else
          id="files-shared-with-me-shares-table"
          v-model="sharesSelected"
          class="files-table"
          :class="{ 'files-table-squashed': !sidebarClosed }"
          :are-thumbnails-displayed="displayThumbnails"
          :resources="shares"
          :target-route="targetRoute"
          :header-position="headerPosition"
          @fileClick="$_fileActions_triggerDefaultAction"
          @rowMounted="rowMounted"
        >
          <template #status="{ resource }">
            <div
              :key="resource.id + resource.status"
              class="uk-text-nowrap uk-flex uk-flex-middle uk-flex-right"
            >
              <oc-button
                v-if="resource.status === shareStatus.declined"
                size="small"
                class="file-row-share-status-action"
                @click.stop="$_acceptShare_trigger(resource)"
              >
                <oc-icon size="small" name="check" />
                <translate>Accept</translate>
              </oc-button>
              <oc-button
                v-if="resource.status === shareStatus.accepted"
                size="small"
                class="file-row-share-status-action"
                @click.stop="$_declineShare_trigger(resource)"
              >
                <oc-icon size="small" name="not_interested" />
                <translate>Decline</translate>
              </oc-button>
            </div>
          </template>
          <template #contextMenu="{ resource }">
            <context-actions :item="resource" />
          </template>
          <template #footer>
            <pagination />
            <list-info
              v-if="hasShares"
              class="uk-width-1-1 oc-my-s"
              :files="sharesCountFiles"
              :folders="sharesCountFolders"
            />
          </template>
        </oc-table-files>
      </div>
    </template>
  </div>
</template>

<script>
import { mapGetters, mapState, mapActions, mapMutations } from 'vuex'
import { shareStatus } from '../helpers/shareStatus'
import { aggregateResourceShares } from '../helpers/resources'
import FileActions from '../mixins/fileActions'
import MixinAcceptShare from '../mixins/actions/acceptShare'
import MixinDeclineShare from '../mixins/actions/declineShare'
import MixinFilesListFilter from '../mixins/filesListFilter'
import MixinFilesListPositioning from '../mixins/filesListPositioning'
import MixinFilesListPagination from '../mixins/filesListPagination'
import MixinMountSideBar from '../mixins/sidebar/mountSideBar'
import { VisibilityObserver } from 'web-pkg/src/observer'
import { ImageDimension, ImageType } from '../constants'
import debounce from 'lodash-es/debounce'

import ListLoader from '../components/FilesList/ListLoader.vue'
import NoContentMessage from '../components/FilesList/NoContentMessage.vue'
import ListInfo from '../components/FilesList/ListInfo.vue'
import Pagination from '../components/FilesList/Pagination.vue'
import ContextActions from '../components/FilesList/ContextActions.vue'

const visibilityObserver = new VisibilityObserver()

export default {
  components: {
    ListLoader,
    NoContentMessage,
    ListInfo,
    Pagination,
    ContextActions
  },

  mixins: [
    FileActions,
    MixinAcceptShare,
    MixinDeclineShare,
    MixinFilesListPositioning,
    MixinFilesListPagination,
    MixinMountSideBar,
    MixinFilesListFilter
  ],

  data: () => ({
    loading: true,
    shareStatus,
    showMorePending: false,
    viewMode: shareStatus.accepted
  }),

  computed: {
    ...mapGetters('Files', ['activeFiles', 'selectedFiles', 'inProgress']),
    ...mapGetters(['isOcis', 'configuration', 'getToken']),
    ...mapState('Files/sidebar', { sidebarClosed: 'closed' }),

    // pending shares
    pendingSelected: {
      get() {
        return this.selectedFiles.filter(r => r.status === shareStatus.pending)
      },
      set(resources) {
        // this will (intentionally) reset the file selection to pending shares only.
        this.SET_FILE_SELECTION(resources.filter(r => r.status === shareStatus.pending))
      }
    },
    pendingTitle() {
      return this.$gettext('Pending shares')
    },
    pendingHasMore() {
      return this.pendingCount > 3
    },
    pendingToggleMoreLabel() {
      return this.showMorePending ? this.$gettext('Show less') : this.$gettext('Show more')
    },
    hasPending() {
      return this.pendingCount > 0
    },
    pendingCount() {
      return this.pending.length
    },
    pending() {
      return this.activeFiles.filter(file => file.status === shareStatus.pending)
    },

    // accepted or declined shares
    sharesSelected: {
      get() {
        return this.selectedFiles.filter(r => r.status === this.viewMode)
      },
      set(resources) {
        // this will (intentionally) reset the file selection to shares for the current view mode only.
        this.SET_FILE_SELECTION(resources.filter(r => r.status === this.viewMode))
      }
    },
    sharesTitle() {
      return this.viewMode === shareStatus.declined
        ? this.$gettext('Declined shares')
        : this.$gettext('Accepted shares')
    },
    sharesToggleLabel() {
      return this.viewMode === shareStatus.declined
        ? this.$gettext('Show accepted shares')
        : this.$gettext('Show declined shares')
    },
    sharesEmptyMessage() {
      return this.viewMode === shareStatus.declined
        ? this.$gettext("You don't have any previously declined shares.")
        : this.$gettext("You are currently not collaborating on other people's resources.")
    },
    hasShares() {
      return this.sharesCount > 0
    },
    sharesCount() {
      return this.shares.length
    },
    sharesCountFiles() {
      console.log(this.shares)
      return this.shares.length
    },
    sharesCountFolders() {
      return this.shares.length
    },
    shares() {
      return this.activeFiles.filter(file => file.status === this.viewMode)
    },

    // misc
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
    ...mapActions('Files', ['loadIndicators', 'loadPreview', 'loadAvatars']),
    ...mapActions(['showMessage']),
    ...mapMutations('Files', [
      'LOAD_FILES',
      'SET_FILE_SELECTION',
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

    togglePendingShowMore() {
      this.showMorePending = !this.showMorePending
    },

    toggleSharesViewMode() {
      if (this.viewMode === shareStatus.accepted) {
        this.viewMode = shareStatus.declined
        return
      }
      this.viewMode = shareStatus.accepted
    }
  }
}
</script>

<style lang="scss" scoped>
.shares-header {
  display: flex;
  flex-direction: row;
  align-items: baseline;
}
</style>
