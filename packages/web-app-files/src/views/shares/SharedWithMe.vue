<template>
  <div class="oc-flex">
    <files-view-wrapper class="oc-flex-column">
      <app-bar :has-shares-navigation="true" :has-bulk-actions="true" />
      <app-loading-spinner v-if="areResourcesLoading" />
      <template v-else>
        <shared-with-me-section
          v-if="pendingItems.length > 0"
          id="files-shared-with-me-pending-section"
          :title="pendingTitle"
          :items="pendingItems"
          :share-status="ShareStatus.pending"
          :sort-by="pendingSortBy"
          :sort-dir="pendingSortDir"
          :sort-handler="pendingHandleSort"
          :show-more-toggle="true"
          :resource-clickable="false"
          :display-thumbnails="false"
        />

        <shared-with-me-section
          id="files-shared-with-me-accepted-section"
          :title="acceptedTitle"
          :empty-message="acceptedEmptyMessage"
          :items="acceptedItems"
          :share-status="ShareStatus.accepted"
          :sort-by="acceptedSortBy"
          :sort-dir="acceptedSortDir"
          :sort-handler="acceptedHandleSort"
          :resource-clickable="true"
          :display-thumbnails="displayThumbnails"
        />

        <shared-with-me-section
          id="files-shared-with-me-declined-section"
          :title="declinedTitle"
          :empty-message="declinedEmptyMessage"
          :items="declinedItems"
          :share-status="ShareStatus.declined"
          :sort-by="declinedSortBy"
          :sort-dir="declinedSortDir"
          :sort-handler="declinedHandleSort"
          :show-more-toggle="true"
          :display-thumbnails="false"
          :resource-clickable="false"
        />
      </template>
    </files-view-wrapper>
    <side-bar />
  </div>
</template>

<script lang="ts">
import { mapGetters } from 'vuex'
import { useSort, useResourcesViewDefaults } from '../../composables'

import AppLoadingSpinner from 'web-pkg/src/components/AppLoadingSpinner.vue'
import AppBar from '../../components/AppBar/AppBar.vue'
import SharedWithMeSection from '../../components/Shares/SharedWithMeSection.vue'
import { ShareStatus } from 'web-client/src/helpers/share'
import { computed, defineComponent, unref } from '@vue/composition-api'
import { Resource } from 'web-client'
import SideBar from '../../components/SideBar/SideBar.vue'
import FilesViewWrapper from '../../components/FilesViewWrapper.vue'

export default defineComponent({
  components: {
    FilesViewWrapper,
    AppBar,
    AppLoadingSpinner,
    SharedWithMeSection,
    SideBar
  },

  setup() {
    const { storeItems, fields, loadResourcesTask, areResourcesLoading } = useResourcesViewDefaults<
      Resource,
      any,
      any[]
    >()

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
      declinedItems
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
      return this.$gettext("You are not collaborating on other people's resources.")
    },

    declinedTitle() {
      return this.$gettext('Declined shares')
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
  }
})
</script>
