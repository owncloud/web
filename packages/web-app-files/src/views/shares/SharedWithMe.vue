<template>
  <div class="oc-flex oc-flex-column">
    <list-loader v-if="loadResourcesTask.isRunning" />
    <template v-else>
      <!-- Pending shares -->
      <div v-if="hasPending">
        <h2 class="oc-px-m oc-py-s">
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
          :are-resources-clickable="false"
          :header-position="fileListHeaderY"
          :hover="true"
          :sort-by="pendingSortBy"
          :sort-dir="pendingSortDir"
          @sort="pendingHandleSort"
        >
          <template #status="{ resource }">
            <div
              :key="resource.id + resource.status"
              class="oc-text-nowrap oc-flex oc-flex-middle oc-flex-right"
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
                <oc-icon size="small" name="close" />
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
            <div class="oc-width-1-1 oc-text-center oc-mt">
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
      <h2 class="oc-px-m oc-py-s">
        {{ sharesTitle }}
        <span class="oc-text-initial">({{ sharesCount }})</span>
        <oc-button
          id="files-shared-with-me-toggle-view-mode"
          appearance="raw"
          type="router-link"
          :to="sharesToggleRouterLink"
          :data-test-set-view-mode="sharesInvertedViewMode.toString()"
        >
          {{ sharesToggleLabel }}
        </oc-button>
      </h2>

      <no-content-message
        v-if="!hasShares"
        id="files-shared-with-me-shares-empty"
        class="files-empty oc-flex-stretch"
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
        :are-resources-clickable="showsAcceptedShares"
        :target-route="resourceTargetLocation"
        :header-position="fileListHeaderY"
        :hover="true"
        :sort-by="sharesSortBy"
        :sort-dir="sharesSortDir"
        @fileClick="$_fileActions_triggerDefaultAction"
        @rowMounted="rowMounted"
        @sort="sharesHandleSort"
      >
        <template #status="{ resource }">
          <div
            :key="resource.id + resource.status"
            class="oc-text-nowrap oc-flex oc-flex-middle oc-flex-right"
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
              <oc-icon size="small" name="close" />
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
            class="oc-width-1-1 oc-my-s"
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
import ResourceTable from '../../components/FilesList/ResourceTable.vue'
import FileActions from '../../mixins/fileActions'
import MixinAcceptShare from '../../mixins/actions/acceptShare'
import MixinDeclineShare from '../../mixins/actions/declineShare'
import MixinFilesListFilter from '../../mixins/filesListFilter'
import MixinMountSideBar from '../../mixins/sidebar/mountSideBar'
import { VisibilityObserver } from 'web-pkg/src/observer'
import { ImageDimension, ImageType } from '../../constants'
import { useSort, useResourcesViewDefaults } from '../../composables'
import { useRouteQuery } from 'web-pkg/src/composables'
import debounce from 'lodash-es/debounce'

import ListLoader from '../../components/FilesList/ListLoader.vue'
import NoContentMessage from '../../components/FilesList/NoContentMessage.vue'
import ListInfo from '../../components/FilesList/ListInfo.vue'
import ContextActions from '../../components/FilesList/ContextActions.vue'
import { ShareStatus } from '../../helpers/share'
import { computed, unref } from '@vue/composition-api'
import { createLocationSpaces } from '../../router'

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
    const { fileListHeaderY, storeItems, fields, loadResourcesTask } = useResourcesViewDefaults()

    const viewMode = computed(() =>
      parseInt(String(unref(useRouteQuery('view-mode', ShareStatus.accepted.toString()))))
    )

    // pending shares
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
      fields,
      sortByQueryName: 'pending-sort-by',
      sortDirQueryName: 'pending-sort-dir'
    })

    // shares depending on view mode
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
      fields,
      sortByQueryName: 'shares-sort-by',
      sortDirQueryName: 'shares-sort-dir'
    })

    return {
      // defaults
      fileListHeaderY,
      loadResourcesTask,

      // view specific
      viewMode,
      pendingHandleSort,
      pendingSortBy,
      pendingSortDir,
      pendingItems,
      sharesHandleSort,
      sharesSortBy,
      sharesSortDir,
      sharesItems,

      resourceTargetLocation: createLocationSpaces('files-spaces-personal-home')
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
    showsAcceptedShares() {
      return this.viewMode === ShareStatus.accepted
    },
    showsDeclinedShares() {
      return this.viewMode === ShareStatus.declined
    },
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
      return this.showsDeclinedShares
        ? this.$gettext('Declined shares')
        : this.$gettext('Accepted shares')
    },
    sharesToggleLabel() {
      return this.showsDeclinedShares
        ? this.$gettext('Show accepted shares')
        : this.$gettext('Show declined shares')
    },
    sharesEmptyMessage() {
      return this.showsDeclinedShares
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
    sharesInvertedViewMode() {
      return this.showsAcceptedShares ? ShareStatus.declined : ShareStatus.accepted
    },
    sharesToggleRouterLink() {
      return {
        name: this.$route.name,
        params: {
          ...this.$route.params
        },
        query: {
          ...this.$route.query,
          'view-mode': this.sharesInvertedViewMode
        }
      }
    },
    displayThumbnails() {
      return !this.configuration.options.disablePreviews && this.viewMode === ShareStatus.accepted
    }
  },

  created() {
    this.loadResourcesTask.perform()
  },

  beforeDestroy() {
    visibilityObserver.disconnect()
  },

  methods: {
    ...mapActions('Files', ['loadIndicators', 'loadPreview', 'loadAvatars']),
    ...mapActions(['showMessage']),
    ...mapMutations('Files', ['LOAD_FILES', 'SET_FILE_SELECTION', 'CLEAR_CURRENT_FILES_LIST']),

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
