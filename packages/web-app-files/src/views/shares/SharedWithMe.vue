<template>
  <div class="oc-flex">
    <files-view-wrapper class="oc-flex-column">
      <app-bar :has-bulk-actions="true" :side-bar-open="sideBarOpen">
        <template #navigation>
          <SharesNavigation />
        </template>
      </app-bar>
      <app-loading-spinner v-if="areResourcesLoading" />
      <template v-else>
        <shared-with-me-section
          v-if="pendingItems.length > 0"
          id="files-shared-with-me-pending-section"
          :display-thumbnails="false"
          :file-list-header-y="fileListHeaderY"
          :items="pendingItems"
          :resource-clickable="false"
          :share-status="ShareStatus.pending"
          :show-more-toggle="true"
          :side-bar-open="sideBarOpen"
          :sort-by="pendingSortBy"
          :sort-dir="pendingSortDir"
          :sort-handler="pendingHandleSort"
          :title="pendingTitle"
        />

        <shared-with-me-section
          id="files-shared-with-me-accepted-section"
          :display-thumbnails="displayThumbnails"
          :empty-message="acceptedEmptyMessage"
          :file-list-header-y="fileListHeaderY"
          :items="acceptedItems"
          :resource-clickable="true"
          :share-status="ShareStatus.accepted"
          :side-bar-open="sideBarOpen"
          :sort-by="acceptedSortBy"
          :sort-dir="acceptedSortDir"
          :sort-handler="acceptedHandleSort"
          :title="acceptedTitle"
          :grouping-settings="groupingSettings"
        />

        <shared-with-me-section
          id="files-shared-with-me-declined-section"
          :display-thumbnails="false"
          :empty-message="declinedEmptyMessage"
          :file-list-header-y="fileListHeaderY"
          :items="declinedItems"
          :resource-clickable="false"
          :share-status="ShareStatus.declined"
          :show-more-toggle="true"
          :side-bar-open="sideBarOpen"
          :sort-by="declinedSortBy"
          :sort-dir="declinedSortDir"
          :sort-handler="declinedHandleSort"
          :title="declinedTitle"
          :grouping-settings="groupingSettings"
        />
      </template>
    </files-view-wrapper>
    <side-bar :open="sideBarOpen" :active-panel="sideBarActivePanel" :space="selectedShareSpace" />
  </div>
</template>

<script lang="ts">
import { mapGetters } from 'vuex'
import { useResourcesViewDefaults } from '../../composables'

import AppLoadingSpinner from 'web-pkg/src/components/AppLoadingSpinner.vue'
import AppBar from 'web-pkg/src/components/AppBar/AppBar.vue'
import SharedWithMeSection from '../../components/Shares/SharedWithMeSection.vue'
import { ShareStatus } from 'web-client/src/helpers/share'
import { computed, defineComponent, unref } from 'vue'
import { Resource } from 'web-client'
import SideBar from '../../components/SideBar/SideBar.vue'
import FilesViewWrapper from '../../components/FilesViewWrapper.vue'
import { useGetMatchingSpace, useSort } from 'web-pkg/src/composables'
import { useGroupingSettings } from 'web-pkg/src/cern/composables'
import SharesNavigation from 'web-app-files/src/components/AppBar/SharesNavigation.vue'

export default defineComponent({
  components: {
    SharesNavigation,
    FilesViewWrapper,
    AppBar,
    AppLoadingSpinner,
    SharedWithMeSection,
    SideBar
  },

  setup() {
    const {
      areResourcesLoading,
      sortFields,
      fileListHeaderY,
      loadResourcesTask,
      selectedResources,
      selectedResourcesIds,
      sideBarActivePanel,
      sideBarOpen,
      storeItems,
      scrollToResourceFromRoute
    } = useResourcesViewDefaults<Resource, any, any[]>()

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
      fields: sortFields,
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
      fields: sortFields,
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
      fields: sortFields,
      sortByQueryName: 'declined-sort-by',
      sortDirQueryName: 'declined-sort-dir'
    })

    const { getMatchingSpace } = useGetMatchingSpace()
    const selectedShareSpace = computed(() => {
      if (unref(selectedResources).length !== 1) {
        return null
      }
      const resource = unref(selectedResources)[0]
      return getMatchingSpace(resource)
    })

    return {
      // defaults
      loadResourcesTask,
      areResourcesLoading,
      selectedResources,
      selectedResourcesIds,
      fileListHeaderY,
      sideBarOpen,
      sideBarActivePanel,
      selectedShareSpace,
      scrollToResourceFromRoute,

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

      // CERN
      ...useGroupingSettings({ sortBy: acceptedSortBy, sortDir: acceptedSortDir })
    }
  },

  data: () => ({
    ShareStatus
  }),

  computed: {
    ...mapGetters(['configuration']),

    pendingTitle() {
      return this.$gettext('Pending shares')
    },

    acceptedTitle() {
      return this.$gettext('Accepted shares')
    },
    acceptedEmptyMessage() {
      return this.$gettext('You have no accepted shares.')
    },

    declinedTitle() {
      return this.$gettext('Declined shares')
    },
    declinedEmptyMessage() {
      return this.$gettext('You have no declined shares.')
    },
    displayThumbnails() {
      return !this.configuration?.options?.disablePreviews
    }
  },

  async created() {
    await this.loadResourcesTask.perform()
    this.scrollToResourceFromRoute(
      [...this.acceptedItems, ...this.pendingItems, ...this.declinedItems],
      'files-app-bar'
    )
  }
})
</script>
