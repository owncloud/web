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
        <!-- TODO: Make styling final -->
        <div class="button-group oc-button-group oc-m-m">
          <oc-button
            :appearance="areHiddenFilesShown ? 'raw' : 'filled'"
            class="oc-px-m"
            @click="setAreHiddenFilesShown(false)"
          >
            Shares
          </oc-button>
          <oc-button
            :appearance="areHiddenFilesShown ? 'filled' : 'raw'"
            class="oc-px-m"
            @click="setAreHiddenFilesShown(true)"
          >
            Hidden Shares
          </oc-button>
        </div>
        <shared-with-me-section
          v-if="!areHiddenFilesShown"
          id="files-shared-with-me-visible-view"
          :display-thumbnails="displayThumbnails"
          :file-list-header-y="fileListHeaderY"
          :items="visibleShares"
          :resource-clickable="true"
          :show-more-toggle="true"
          :side-bar-open="sideBarOpen"
          :sort-by="acceptedSortBy"
          :sort-dir="acceptedSortDir"
          :sort-handler="acceptedHandleSort"
          :title="shareSectionTitle"
        />
        <shared-with-me-section
          v-if="areHiddenFilesShown"
          id="files-shared-with-me-hidden-view"
          :display-thumbnails="displayThumbnails"
          :file-list-header-y="fileListHeaderY"
          :items="hiddenShares"
          :resource-clickable="false"
          :show-more-toggle="true"
          :side-bar-open="sideBarOpen"
          :sort-by="acceptedSortBy"
          :sort-dir="acceptedSortDir"
          :sort-handler="acceptedHandleSort"
          :title="shareSectionTitle"
        />
      </template>
    </files-view-wrapper>
    <side-bar :open="sideBarOpen" :active-panel="sideBarActivePanel" :space="selectedShareSpace" />
  </div>
</template>

<script lang="ts">
import { useResourcesViewDefaults } from '../../composables'

import { AppLoadingSpinner } from '@ownclouders/web-pkg'
import { AppBar } from '@ownclouders/web-pkg'
import SharedWithMeSection from '../../components/Shares/SharedWithMeSection.vue'
import { ShareStatus } from '@ownclouders/web-client/src/helpers/share'
import { computed, defineComponent, unref } from 'vue'
import { Resource } from '@ownclouders/web-client'
import SideBar from '../../components/SideBar/SideBar.vue'
import FilesViewWrapper from '../../components/FilesViewWrapper.vue'
import { useGetMatchingSpace, useSort } from '@ownclouders/web-pkg'
// import { useGroupingSettings } from '@ownclouders/web-pkg'
import SharesNavigation from 'web-app-files/src/components/AppBar/SharesNavigation.vue'
import { useGettext } from 'vue3-gettext'
import { useStore } from 'web-pkg/src/composables'

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

    const { $gettext } = useGettext()

    const areHiddenFilesShown = ref(false)

    const shareSectionTitle = computed(() => {
      return areHiddenFilesShown.value ? $gettext('Hidden Shares') : $gettext('Shares')
    })

    const setAreHiddenFilesShown = (value: boolean) => {
      areHiddenFilesShown.value = value
    }

    const visibleShares = computed(() => unref(storeItems).filter((r) => r.hide !== 'true'))
    const hiddenShares = computed(() => unref(storeItems).filter((r) => r.hide === 'true'))

    // TODO: Adapt for show/hidden state
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
    const store = useStore()

    const displayThumbnails = computed(() => store.getters.configuration?.options?.disablePreviews)

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

      areHiddenFilesShown,
      displayThumbnails,
      hiddenShares,
      setAreHiddenFilesShown,
      shareSectionTitle,
      visibleShares,

      // TODO: Add sorting via useSort
      acceptedHandleSort,
      acceptedSortBy,
      acceptedSortDir,
      acceptedItems

      // TODO: Renable for hidden/shown shares
      // CERN
      // ...useGroupingSettings({ sortBy: acceptedSortBy, sortDir: acceptedSortDir })
    }
  },

  data: () => ({
    ShareStatus
  }),

  async created() {
    await this.loadResourcesTask.perform()
    // TODO: Fix
    // this.scrollToResourceFromRoute(
    //   [...this.acceptedItems, ...this.pendingItems, ...this.declinedItems],
    //   'files-app-bar'
    // )
  }
})
</script>
