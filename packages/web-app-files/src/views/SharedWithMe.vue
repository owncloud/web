<template>
  <div class="uk-flex uk-flex-column">
    <list-loader v-if="loadResourcesTask.isRunning" />
    <template v-else>
      <!-- Pending shares -->
      <div v-if="hasPending">
        <h2 class="oc-p-s">
          {{ pendingTitle }}
          <span class="oc-text-initial">({{ pendingCount }})</span>
        </h2>

        <oc-table-files
          id="files-shared-with-me-pending-table"
          v-model="pendingSelected"
          :data-test-share-status="shareStatus.pending"
          class="files-table"
          :class="{ 'files-table-squashed': !sidebarClosed }"
          :are-thumbnails-displayed="displayThumbnails"
          :resources="showMorePending ? pending : pending.slice(0, 3)"
          :target-route="targetRoute"
          :are-resources-clickable="false"
          :header-position="headerPosition"
        >
          <template #status="{ resource }">
            <div
              :key="resource.id + resource.status"
              class="uk-text-nowrap uk-flex uk-flex-middle uk-flex-right"
            >
              <oc-button
                size="small"
                variation="success"
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
            <div class="uk-width-1-1 uk-text-center oc-mt">
              <oc-button
                id="files-shared-with-me-pending-show-all"
                appearance="raw"
                gap-size="xsmall"
                size="small"
                :data-test-expand="(!showMorePending).toString()"
                @click="togglePendingShowMore"
              >
                {{ pendingToggleMoreLabel }}
                <oc-icon :name="'chevron_' + (showMorePending ? 'up' : 'down')" />
              </oc-button>
            </div>
          </template>
        </oc-table-files>
      </div>

      <!-- Accepted or declined shares -->
      <h2 class="oc-p-s">
        {{ sharesTitle }}
        <span class="oc-text-initial">({{ sharesCount }})</span>
        <oc-button
          id="files-shared-with-me-toggle-view-mode"
          appearance="raw"
          type="router-link"
          :to="sharesToggleRouterLink"
          :data-test-set-view-mode="sharesOtherViewMode.toString()"
        >
          {{ sharesToggleLabel }}
        </oc-button>
      </h2>

      <no-content-message
        v-if="!hasShares"
        id="files-shared-with-me-shares-empty"
        class="files-empty uk-flex-stretch"
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
        :data-test-share-status="viewMode"
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
              variation="success"
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
          <list-info
            v-if="hasShares"
            class="uk-width-1-1 oc-my-s"
            :files="sharesCountFiles"
            :folders="sharesCountFolders"
          />
        </template>
      </oc-table-files>
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
import MixinMountSideBar from '../mixins/sidebar/mountSideBar'
import { VisibilityObserver } from 'web-pkg/src/observer'
import { ImageDimension, ImageType } from '../constants'
import debounce from 'lodash-es/debounce'

import ListLoader from '../components/FilesList/ListLoader.vue'
import NoContentMessage from '../components/FilesList/NoContentMessage.vue'
import ListInfo from '../components/FilesList/ListInfo.vue'
import ContextActions from '../components/FilesList/ContextActions.vue'
import { useTask } from 'vue-concurrency'

const visibilityObserver = new VisibilityObserver()

export default {
  components: {
    ListLoader,
    NoContentMessage,
    ListInfo,
    ContextActions
  },

  mixins: [
    FileActions,
    MixinAcceptShare,
    MixinDeclineShare,
    MixinFilesListPositioning,
    MixinMountSideBar,
    MixinFilesListFilter
  ],

  setup() {
    const loadResourcesTask = useTask(function* (signal, ref) {
      ref.CLEAR_CURRENT_FILES_LIST()

      let resources = yield ref.$client.requests.ocs({
        service: 'apps/files_sharing',
        action: '/api/v1/shares?format=json&shared_with_me=true&state=all&include_tags=false',
        method: 'GET'
      })

      resources = yield resources.json()
      resources = resources.ocs.data

      if (resources.length) {
        resources = aggregateResourceShares(
          resources,
          true,
          !ref.isOcis,
          ref.configuration.server,
          ref.getToken
        )
      }

      ref.LOAD_FILES({ currentFolder: null, files: resources })
    })

    return { loadResourcesTask }
  },

  data: () => ({
    shareStatus,
    showMorePending: false
  }),

  computed: {
    ...mapGetters('Files', ['activeFiles', 'selectedFiles', 'inProgress']),
    ...mapGetters(['isOcis', 'configuration', 'getToken']),
    ...mapState('Files/sidebar', { sidebarClosed: 'closed' }),

    viewMode() {
      if (Object.prototype.hasOwnProperty.call(this.$route.query, 'view-mode')) {
        return parseInt(this.$route.query['view-mode'])
      }
      return shareStatus.accepted
    },

    // pending shares
    pendingSelected: {
      get() {
        return this.selectedFiles.filter((r) => r.status === shareStatus.pending)
      },
      set(resources) {
        // this will (intentionally) reset the file selection to pending shares only.
        this.SET_FILE_SELECTION(resources.filter((r) => r.status === shareStatus.pending))
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
      return this.activeFiles.filter((file) => file.status === shareStatus.pending)
    },

    // accepted or declined shares
    sharesSelected: {
      get() {
        return this.selectedFiles.filter((r) => r.status === this.viewMode)
      },
      set(resources) {
        // this will (intentionally) reset the file selection to shares for the current view mode only.
        this.SET_FILE_SELECTION(resources.filter((r) => r.status === this.viewMode))
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
        : this.$gettext("You are not collaborating on other people's resources.")
    },
    hasShares() {
      return this.sharesCount > 0
    },
    sharesCount() {
      return this.shares.length
    },
    sharesCountFiles() {
      return this.shares.filter((s) => s.type !== 'folder').length
    },
    sharesCountFolders() {
      return this.shares.filter((s) => s.type === 'folder').length
    },
    shares() {
      return this.activeFiles.filter((file) => file.status === this.viewMode)
    },
    sharesOtherViewMode() {
      return this.viewMode === shareStatus.accepted ? shareStatus.declined : shareStatus.accepted
    },
    sharesToggleRouterLink() {
      return {
        name: this.$route.name,
        params: {
          ...this.$route.params
        },
        query: {
          ...this.$route.query,
          'view-mode': this.sharesOtherViewMode
        }
      }
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
    }
  },

  created() {
    this.loadResourcesTask.perform(this)
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

    togglePendingShowMore() {
      this.showMorePending = !this.showMorePending
    }
  }
}
</script>
