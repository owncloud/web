<template>
  <div class="oc-flex">
    <files-view-wrapper class="oc-flex-column">
      <app-bar
        :has-shares-navigation="true"
        :has-bulk-actions="true"
        :side-bar-open="sideBarOpen"
      />
      <app-loading-spinner v-if="areResourcesLoading" />
      <template v-else>
        <h2 class="oc-px-m oc-py-s" style="margin-top: 0">
          {{ showHiddenShares ? declinedTitle : acceptedTitle }}
          <span class="oc-text-medium"
            >({{ showHiddenShares ? declinedItems.length : acceptedItems.length }})</span
          >
          <oc-button
            id="files-shared-with-me-toggle-view-mode"
            class="oc-ml-m"
            @click.stop="switchHiddenShares"
          >
            {{ switchHiddenSharesLabel }}
          </oc-button>
        </h2>
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
import AppBar from '../../components/AppBar/AppBar.vue'
import SharedWithMeSection from '../../components/Shares/SharedWithMeSection.vue'
import { ShareStatus } from 'web-client/src/helpers/share'
import { computed, defineComponent, ref, unref } from 'vue'
import { Resource } from 'web-client'
import SideBar from '../../components/SideBar/SideBar.vue'
import FilesViewWrapper from '../../components/FilesViewWrapper.vue'
import { buildShareSpaceResource } from 'web-client/src/helpers'
import { configurationManager } from 'web-pkg/src/configuration'
import { useCapabilityShareJailEnabled, useSort, useStore } from 'web-pkg/src/composables'
import { useGettext } from 'vue3-gettext'

export default defineComponent({
  components: {
    FilesViewWrapper,
    AppBar,
    AppLoadingSpinner,
    SharedWithMeSection,
    SideBar
  },

  setup() {
    const { $gettext } = useGettext()

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
    const pending = computed(() => [])
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
      unref(storeItems).filter((item) => item.status !== ShareStatus.declined)
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

    const store = useStore()
    const hasShareJail = useCapabilityShareJailEnabled()
    const selectedShareSpace = computed(() => {
      if (unref(selectedResources).length !== 1) {
        return null
      }
      const resource = unref(selectedResources)[0]
      if (!unref(hasShareJail)) {
        return store.getters['runtime/spaces/spaces'].find(
          (space) => space.driveType === 'personal'
        )
      }

      return buildShareSpaceResource({
        shareId: resource.shareId,
        shareName: resource.name,
        serverUrl: configurationManager.serverUrl
      })
    })

    const showHiddenShares = ref(false)

    const switchHiddenShares = () => {
      showHiddenShares.value = !showHiddenShares.value
    }

    const switchHiddenSharesLabel = computed(() =>
      showHiddenShares.value ? $gettext('Show shares') : $gettext('Show hidden shares')
    )

    return {
      ShareStatus,
      showHiddenShares,
      switchHiddenShares,
      switchHiddenSharesLabel,

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
      declinedItems
    }
  },

  computed: {
    ...mapGetters(['configuration']),

    pendingTitle() {
      return this.$gettext('Pending shares')
    },

    acceptedTitle() {
      return this.$gettext('Shared with me')
    },
    acceptedEmptyMessage() {
      return this.$gettext('You have no accepted shares.')
    },

    declinedTitle() {
      return this.$gettext('Hidden shares')
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
    this.scrollToResourceFromRoute([
      ...this.acceptedItems,
      ...this.pendingItems,
      ...this.declinedItems
    ])
  }
})
</script>
