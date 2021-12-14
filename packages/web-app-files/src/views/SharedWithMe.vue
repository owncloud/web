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

        <resource-table
          id="files-shared-with-me-pending-table"
          v-model="pendingSelected"
          :data-test-share-status="ShareStatus.pending"
          class="files-table"
          :class="{ 'files-table-squashed': !sidebarClosed }"
          :are-thumbnails-displayed="displayThumbnails"
          :resources="showMorePending ? pendingItems : pendingItems.slice(0, 3)"
          :target-route="targetRoute"
          :are-resources-clickable="false"
          :header-position="fileListHeaderY"
          :sort-by="pendingSortBy"
          :sort-dir="pendingSortDir"
          @sort="pendingHandleSort"
        >
          <template #status="{ resource }">
            <div
              :key="resource.id + resource.status"
              class="uk-text-nowrap uk-flex uk-flex-middle uk-flex-right"
            >
              <oc-button
                size="small"
                variation="success"
                class="file-row-share-status-accept"
                @click.stop="$_acceptShare_trigger({ resources: [resource] })"
              >
                <oc-icon size="small" name="check" />
                <translate>Accept</translate>
              </oc-button>
              <oc-button
                size="small"
                class="file-row-share-decline oc-ml-s"
                @click.stop="$_declineShare_trigger({ resources: [resource] })"
              >
                <oc-icon size="small" name="forbid" />
                <translate>Decline</translate>
              </oc-button>
            </div>
          </template>
          <template #contextMenu="{ resource }">
            <context-actions
              v-if="isResourceInPendingSelection(resource)"
              :items="pendingSelected"
            />
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
                <oc-icon
                  :name="'arrow-' + (showMorePending ? 'up' : 'down') + '-s'"
                  fill-type="line"
                />
              </oc-button>
            </div>
          </template>
        </resource-table>
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
      <resource-table
        v-else
        id="files-shared-with-me-shares-table"
        v-model="sharesSelected"
        :data-test-share-status="viewMode"
        class="files-table"
        :class="{ 'files-table-squashed': !sidebarClosed }"
        :are-thumbnails-displayed="displayThumbnails"
        :resources="sharesItems"
        :target-route="resourceTargetLocation"
        :header-position="fileListHeaderY"
        :sort-by="sharesSortBy"
        :sort-dir="sharesSortDir"
        @fileClick="$_fileActions_triggerDefaultAction"
        @rowMounted="rowMounted"
        @sort="sharesHandleSort"
      >
        <template #status="{ resource }">
          <div
            :key="resource.id + resource.status"
            class="uk-text-nowrap uk-flex uk-flex-middle uk-flex-right"
          >
            <oc-button
              v-if="resource.status === ShareStatus.declined"
              size="small"
              variation="success"
              class="file-row-share-status-accept"
              @click.stop="$_acceptShare_trigger({ resources: [resource] })"
            >
              <oc-icon size="small" name="check" />
              <translate>Accept</translate>
            </oc-button>
            <oc-button
              v-if="resource.status === ShareStatus.accepted"
              size="small"
              class="file-row-share-status-decline"
              @click.stop="$_declineShare_trigger({ resources: [resource] })"
            >
              <oc-icon size="small" name="forbid" />
              <translate>Decline</translate>
            </oc-button>
          </div>
        </template>
        <template #contextMenu="{ resource }">
          <context-actions v-if="isResourceInSharesSelection(resource)" :items="sharesSelected" />
        </template>
        <template #footer>
          <list-info
            v-if="hasShares"
            class="uk-width-1-1 oc-my-s"
            :files="sharesCountFiles"
            :folders="sharesCountFolders"
          />
        </template>
      </resource-table>
    </template>
  </div>
</template>

<script>
import { mapGetters, mapState, mapActions, mapMutations } from 'vuex'
import ResourceTable, { determineSortFields } from '../components/FilesList/ResourceTable.vue'
import { aggregateResourceShares } from '../helpers/resources'
import FileActions from '../mixins/fileActions'
import MixinAcceptShare from '../mixins/actions/acceptShare'
import MixinDeclineShare from '../mixins/actions/declineShare'
import MixinFilesListFilter from '../mixins/filesListFilter'
import MixinMountSideBar from '../mixins/sidebar/mountSideBar'
import { VisibilityObserver } from 'web-pkg/src/observer'
import { ImageDimension, ImageType } from '../constants'
import { useFileListHeaderPosition, useRouteQuery, useSort, useStore } from '../composables'
import debounce from 'lodash-es/debounce'

import ListLoader from '../components/FilesList/ListLoader.vue'
import NoContentMessage from '../components/FilesList/NoContentMessage.vue'
import ListInfo from '../components/FilesList/ListInfo.vue'
import ContextActions from '../components/FilesList/ContextActions.vue'
import { useTask } from 'vue-concurrency'
import { ShareStatus } from '../helpers/share'
import { computed, unref } from '@vue/composition-api'
import { createLocationSpaces } from '../router'

const visibilityObserver = new VisibilityObserver()

export default {
  components: {
    ResourceTable,
    ListLoader,
    NoContentMessage,
    ListInfo,
    ContextActions
  },

  mixins: [
    FileActions,
    MixinAcceptShare,
    MixinDeclineShare,
    MixinMountSideBar,
    MixinFilesListFilter
  ],

  setup() {
    const store = useStore()
    const { y: fileListHeaderY } = useFileListHeaderPosition()
    const storeItems = computed(() => store.getters['Files/activeFiles'] || [])
    const fields = computed(() => {
      return determineSortFields(unref(storeItems)[0])
    })

    const viewMode = computed(() =>
      parseInt(String(unref(useRouteQuery('view-mode', ShareStatus.accepted.toString()))))
    )

    // pending shares
    const pendingSortByPageQuery = useRouteQuery('pending-sort-by')
    const pendingSortDirPageQuery = useRouteQuery('pending-sort-dir')
    const pending = computed(() =>
      unref(storeItems).filter((item) => item.status === ShareStatus.pending)
    )
    const {
      sortBy: pendingSortBy,
      sortDir: pendingSortDir,
      items: pendingItems,
      handleSort: pendingHandleSort
    } = useSort({
      items: pending,
      fields: fields,
      sortBy: pendingSortByPageQuery,
      sortDir: pendingSortDirPageQuery
    })

    // shares depending on view mode
    const sharesSortByPageQuery = useRouteQuery('shares-sort-by')
    const sharesSortDirPageQuery = useRouteQuery('shares-sort-dir')
    const shares = computed(() =>
      unref(storeItems).filter((item) => item.status === unref(viewMode))
    )
    const {
      sortBy: sharesSortBy,
      sortDir: sharesSortDir,
      items: sharesItems,
      handleSort: sharesHandleSort
    } = useSort({
      items: shares,
      fields: fields,
      sortBy: sharesSortByPageQuery,
      sortDir: sharesSortDirPageQuery
    })

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

    return {
      resourceTargetLocation: createLocationSpaces('files-spaces-personal-home'),
      viewMode,
      fileListHeaderY,
      loadResourcesTask,
      pendingHandleSort,
      pendingSortBy,
      pendingSortDir,
      pendingItems,
      sharesHandleSort,
      sharesSortBy,
      sharesSortDir,
      sharesItems
    }
  },

  data: () => ({
    ShareStatus,
    showMorePending: false
  }),

  computed: {
    ...mapGetters('Files', ['selectedFiles']),
    ...mapGetters(['isOcis', 'configuration', 'getToken']),
    ...mapState('Files/sidebar', { sidebarClosed: 'closed' }),

    // pending shares
    pendingSelected: {
      get() {
        return this.selectedFiles.filter((r) => r.status === ShareStatus.pending)
      },
      set(resources) {
        // this will (intentionally) reset the file selection to pending shares only.
        this.SET_FILE_SELECTION(resources.filter((r) => r.status === ShareStatus.pending))
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
      return this.pendingItems.length
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
      return this.viewMode === ShareStatus.declined
        ? this.$gettext('Declined shares')
        : this.$gettext('Accepted shares')
    },
    sharesToggleLabel() {
      return this.viewMode === ShareStatus.declined
        ? this.$gettext('Show accepted shares')
        : this.$gettext('Show declined shares')
    },
    sharesEmptyMessage() {
      return this.viewMode === ShareStatus.declined
        ? this.$gettext("You don't have any previously declined shares.")
        : this.$gettext("You are not collaborating on other people's resources.")
    },
    hasShares() {
      return this.sharesCount > 0
    },
    sharesCount() {
      return this.sharesItems.length
    },
    sharesCountFiles() {
      return this.sharesItems.filter((s) => s.type !== 'folder').length
    },
    sharesCountFolders() {
      return this.sharesItems.filter((s) => s.type === 'folder').length
    },
    sharesOtherViewMode() {
      return this.viewMode === ShareStatus.accepted ? ShareStatus.declined : ShareStatus.accepted
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
    displayThumbnails() {
      return !this.configuration.options.disablePreviews
    }
  },

  created() {
    this.loadResourcesTask.perform(this)
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
    },

    isResourceInPendingSelection(resource) {
      return this.pendingSelected?.includes(resource)
    },

    isResourceInSharesSelection(resource) {
      return this.sharesSelected?.includes(resource)
    }
  }
}
</script>
