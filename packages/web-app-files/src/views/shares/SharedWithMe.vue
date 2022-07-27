<template>
  <div class="oc-flex oc-flex-column">
    <app-bar :has-shares-navigation="true" :has-bulk-actions="true" />
    <app-loading-spinner v-if="areResourcesLoading" />
    <template v-else>
      <shared-with-me-section
        v-if="pendingItems.length > 0"
        :title="pendingTitle"
        :items="pendingItems"
        :share-status="ShareStatus.pending"
        :sort-by="pendingSortBy"
        :sort-dir="pendingSortDir"
        :sort-handler="acceptedHandleSort"
        :show-more-less-toggle="true"
      ></shared-with-me-section>

      <shared-with-me-section
        :title="acceptedTitle"
        :empty-message="acceptedEmptyMessage"
        :items="acceptedItems"
        :share-status="ShareStatus.accepted"
        :sort-by="acceptedSortBy"
        :sort-dir="acceptedSortDir"
        :sort-handler="acceptedHandleSort"
      ></shared-with-me-section>

      <shared-with-me-section
        :title="declinedTitle"
        :empty-message="declinedEmptyMessage"
        :items="declinedItems"
        :share-status="ShareStatus.declined"
        :resource-clickable="false"
        :sort-by="declinedSortBy"
        :sort-dir="declinedSortDir"
        :sort-handler="declinedHandleSort"
      ></shared-with-me-section>
    </template>
  </div>
</template>

<script lang="ts">
import { mapGetters, mapState } from 'vuex'
import { useSort, useResourcesViewDefaults } from '../../composables'
import { useCapabilityShareJailEnabled, useStore } from 'web-pkg/src/composables'

import AppLoadingSpinner from 'web-pkg/src/components/AppLoadingSpinner.vue'
import AppBar from '../../components/AppBar/AppBar.vue'
import SharedWithMeSection from '../../components/Shares/SharedWithMeSection.vue'
import { ShareStatus } from '../../helpers/share'
import { computed, defineComponent, unref } from '@vue/composition-api'
import { createLocationSpaces } from '../../router'
import { Resource } from '../../helpers/resource'

const displayedFields = ['name', 'status', 'owner', 'sdate', 'sharedWith']

export default defineComponent({
  components: {
    AppBar,
    AppLoadingSpinner,
    SharedWithMeSection
  },

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
    ShareStatus
  }),

  computed: {
    ...mapGetters('Files', ['selectedFiles']),
    ...mapGetters(['configuration']),
    ...mapState('Files/sidebar', { sidebarClosed: 'closed' }),

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
    }
  },

  created() {
    this.loadResourcesTask.perform()
  }
})
</script>
