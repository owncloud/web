<template>
  <div class="oc-flex oc-flex-column">
    <app-bar :has-shares-navigation="true" :has-bulk-actions="true" />
    <app-loading-spinner v-if="areResourcesLoading" />
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
          :fields-displayed="displayedFields"
          :are-thumbnails-displayed="false"
          :resources="showMorePending ? pendingItems : pendingItems.slice(0, 3)"
          :are-resources-clickable="false"
          :header-position="fileListHeaderY"
          :sort-by="pendingSortBy"
          :sort-dir="pendingSortDir"
          @sort="pendingHandleSort"
        >
          <template #status="{ resource }">
            <div
              :key="resource.getDomSelector() + resource.status"
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

      <div>
        <!-- Accepted shares -->
        <h2 class="oc-px-m oc-py-s">
          {{ acceptedTitle }}
          <span class="oc-text-initial">({{ acceptedCount }})</span>
        </h2>

        <no-content-message
          v-if="!hasAccepted"
          id="files-shared-with-me-accepted-empty"
          class="files-empty oc-flex-stretch"
          icon="group"
        >
          <template #message>
            <span>{{ acceptedEmptyMessage }}</span>
          </template>
        </no-content-message>
        <resource-table
          v-else
          id="files-shared-with-me-accepted-table"
          v-model="acceptedSelected"
          :data-test-share-status="ShareStatus.accepted"
          class="files-table"
          :class="{ 'files-table-squashed': !sidebarClosed }"
          :fields-displayed="displayedFields"
          :are-thumbnails-displayed="displayThumbnails"
          :resources="acceptedItems"
          :are-resources-clickable="true"
          :target-route="resourceTargetLocation"
          :target-route-param-mapping="resourceTargetParamMapping"
          :target-route-query-mapping="resourceTargetQueryMapping"
          :header-position="fileListHeaderY"
          :sort-by="acceptedSortBy"
          :sort-dir="acceptedSortDir"
          @fileClick="$_fileActions_triggerDefaultAction"
          @rowMounted="rowMounted"
          @sort="acceptedHandleSort"
        >
          <template #status="{ resource }">
            <div
              :key="resource.getDomSelector() + resource.status"
              class="oc-text-nowrap oc-flex oc-flex-middle oc-flex-right"
            >
              <oc-button
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
            <context-actions
              v-if="isResourceInAcceptedSelection(resource)"
              :items="acceptedSelected"
            />
          </template>
          <template #footer>
            <list-info
              v-if="hasAccepted"
              class="oc-width-1-1 oc-my-s"
              :files="acceptedCountFiles"
              :folders="acceptedCountFolders"
            />
          </template>
        </resource-table>
      </div>

      <div>
        <!-- Declined shares -->
        <h2 class="oc-px-m oc-py-s">
          {{ declinedTitle }}
          <span class="oc-text-initial">({{ declinedCount }})</span>
        </h2>

        <no-content-message
          v-if="!hasDeclined"
          id="files-shared-with-me-declined-empty"
          class="files-empty oc-flex-stretch"
          icon="group"
        >
          <template #message>
            <span>{{ declinedEmptyMessage }}</span>
          </template>
        </no-content-message>
        <resource-table
          v-else
          id="files-shared-with-me-declined-table"
          v-model="declinedSelected"
          :data-test-share-status="ShareStatus.declined"
          class="files-table"
          :class="{ 'files-table-squashed': !sidebarClosed }"
          :fields-displayed="displayedFields"
          :are-thumbnails-displayed="false"
          :resources="declinedItems"
          :are-resources-clickable="false"
          :target-route="resourceTargetLocation"
          :target-route-param-mapping="resourceTargetParamMapping"
          :target-route-query-mapping="resourceTargetQueryMapping"
          :header-position="fileListHeaderY"
          :sort-by="declinedSortBy"
          :sort-dir="declinedSortDir"
          @fileClick="$_fileActions_triggerDefaultAction"
          @rowMounted="rowMounted"
          @sort="declinedHandleSort"
        >
          <template #status="{ resource }">
            <div
              :key="resource.getDomSelector() + resource.status"
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
            </div>
          </template>
          <template #contextMenu="{ resource }">
            <context-actions
              v-if="isResourceInDeclinedSelection(resource)"
              :items="declinedSelected"
            />
          </template>
          <template #footer>
            <list-info
              v-if="hasDeclined"
              class="oc-width-1-1 oc-my-s"
              :files="declinedCountFiles"
              :folders="declinedCountFolders"
            />
          </template>
        </resource-table>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
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
import { useCapabilityShareJailEnabled, useStore } from 'web-pkg/src/composables'
import debounce from 'lodash-es/debounce'

import AppLoadingSpinner from 'web-pkg/src/components/AppLoadingSpinner.vue'
import NoContentMessage from 'web-pkg/src/components/NoContentMessage.vue'
import AppBar from '../../components/AppBar/AppBar.vue'
import ListInfo from '../../components/FilesList/ListInfo.vue'
import ContextActions from '../../components/FilesList/ContextActions.vue'
import { ShareStatus } from '../../helpers/share'
import { computed, defineComponent, unref } from '@vue/composition-api'
import { createLocationSpaces } from '../../router'
import { Resource } from '../../helpers/resource'

const visibilityObserver = new VisibilityObserver()
const displayedFields = ['name', 'status', 'owner', 'sdate', 'sharedWith']

export default defineComponent({
  components: {
    AppBar,
    ResourceTable,
    AppLoadingSpinner,
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
    const { fileListHeaderY, storeItems, fields, loadResourcesTask, areResourcesLoading } =
      useResourcesViewDefaults<Resource, any, any[]>()

    const store = useStore()
    const hasShareJail = useCapabilityShareJailEnabled()
    const resourceTargetLocation = computed(() =>
      unref(hasShareJail)
        ? createLocationSpaces('files-spaces-share')
        : createLocationSpaces('files-spaces-personal', {
            params: { storageId: store.getters.user.id }
          })
    )
    const resourceTargetParamMapping = computed(() =>
      unref(hasShareJail) ? { name: 'shareName', path: 'item' } : undefined
    )
    const resourceTargetQueryMapping = computed(() =>
      unref(hasShareJail) ? { id: 'shareId' } : undefined
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

    // accepted shares
    const accepted = computed(() =>
      unref(storeItems).filter((item) => item.status === ShareStatus.accepted)
    )
    const {
      sortBy: acceptedSortBy,
      sortDir: acceptedSortDir,
      items: acceptedItems,
      handleSort: acceptedHandleSort
    } = useSort({
      items: accepted,
      fields,
      sortByQueryName: 'accepted-sort-by',
      sortDirQueryName: 'accepted-sort-dir'
    })

    // declined shares
    const declined = computed(() =>
      unref(storeItems).filter((item) => item.status === ShareStatus.declined)
    )
    const {
      sortBy: declinedSortBy,
      sortDir: declinedSortDir,
      items: declinedItems,
      handleSort: declinedHandleSort
    } = useSort({
      items: declined,
      fields,
      sortByQueryName: 'declined-sort-by',
      sortDirQueryName: 'declined-sort-dir'
    })

    return {
      // defaults
      fileListHeaderY,
      loadResourcesTask,
      areResourcesLoading,

      // view specific
      pendingHandleSort,
      pendingSortBy,
      pendingSortDir,
      pendingItems,

      acceptedHandleSort,
      acceptedSortBy,
      acceptedSortDir,
      acceptedItems,

      declinedHandleSort,
      declinedSortBy,
      declinedSortDir,
      declinedItems,

      displayedFields,
      resourceTargetLocation,
      resourceTargetParamMapping,
      resourceTargetQueryMapping
    }
  },

  data: () => ({
    ShareStatus,
    showMorePending: false
  }),

  computed: {
    ...mapGetters('Files', ['selectedFiles']),
    ...mapGetters(['configuration']),
    ...mapState('Files/sidebar', { sidebarClosed: 'closed' }),

    pendingSelected: {
      get() {
        return this.selectedFiles.filter((r) => r.status === ShareStatus.pending)
      },
      set(resources) {
        // this will (intentionally) reset the file selection to pending shares only.
        this.SET_FILE_SELECTION(resources.filter((r) => r.status === ShareStatus.pending))
      }
    },

    acceptedSelected: {
      get() {
        return this.selectedFiles.filter((r) => r.status === ShareStatus.accepted)
      },
      set(resources) {
        // this will (intentionally) reset the file selection to pending shares only.
        this.SET_FILE_SELECTION(resources.filter((r) => r.status === ShareStatus.accepted))
      }
    },

    declinedSelected: {
      get() {
        return this.selectedFiles.filter((r) => r.status === ShareStatus.declined)
      },
      set(resources) {
        // this will (intentionally) reset the file selection to pending shares only.
        this.SET_FILE_SELECTION(resources.filter((r) => r.status === ShareStatus.declined))
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

    acceptedTitle() {
      return this.$gettext('Accepted shares')
    },
    acceptedHasMore() {
      return this.acceptedCount > 3
    },
    hasAccepted() {
      return this.acceptedCount > 0
    },
    acceptedCount() {
      return this.acceptedItems.length
    },
    acceptedCountFiles() {
      return this.acceptedItems.filter((s) => s.type !== 'folder').length
    },
    acceptedCountFolders() {
      return this.acceptedItems.filter((s) => s.type === 'folder').length
    },
    acceptedEmptyMessage() {
      return this.$gettext("You are not collaborating on other people's resources.")
    },

    declinedTitle() {
      return this.$gettext('Declined shares')
    },
    declinedHasMore() {
      return this.declinedCount > 3
    },
    hasDeclined() {
      return this.declinedCount > 0
    },
    declinedCount() {
      return this.declinedItems.length
    },
    declinedCountFiles() {
      return this.declinedItems.filter((s) => s.type !== 'folder').length
    },
    declinedCountFolders() {
      return this.declinedItems.filter((s) => s.type === 'folder').length
    },
    declinedEmptyMessage() {
      return this.$gettext("You don't have any previously declined shares.")
    },

    displayThumbnails() {
      return !this.configuration?.options?.disablePreviews
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

    isResourceInAcceptedSelection(resource) {
      return this.acceptedSelected?.includes(resource)
    },

    isResourceInDeclinedSelection(resource) {
      return this.declinedSelected?.includes(resource)
    }
  }
})
</script>
