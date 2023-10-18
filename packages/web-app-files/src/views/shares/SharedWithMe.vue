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
        <div class="share-visibility-filter oc-flex oc-m-m">
          <div class="oc-mr-m oc-flex oc-flex-middle">
            <oc-icon name="filter-2" class="oc-mr-xs" />
            <span v-text="$gettext('Filter:')" />
          </div>
          <item-filter-inline
            filter-name="share-visibility"
            :filter-options="visibilityOptions"
            @toggle-filter="setAreHiddenFilesShown"
          />
        </div>
        <shared-with-me-section
          id="files-shared-with-me-view"
          :display-thumbnails="displayThumbnails"
          :file-list-header-y="fileListHeaderY"
          :items="items"
          :resource-clickable="true"
          :show-more-toggle="true"
          :side-bar-open="sideBarOpen"
          :sort-by="sortBy"
          :sort-dir="sortDir"
          :sort-handler="handleSort"
          :title="shareSectionTitle"
          :empty-message="
            areHiddenFilesShown ? $gettext('No hidden shares') : $gettext('No shares')
          "
          :grouping-settings="groupingSettings"
        />
      </template>
    </files-view-wrapper>
    <side-bar :open="sideBarOpen" :active-panel="sideBarActivePanel" :space="selectedShareSpace" />
  </div>
</template>

<script lang="ts">
import { useResourcesViewDefaults } from '../../composables'

import { AppLoadingSpinner, InlineFilterOption } from '@ownclouders/web-pkg'
import { AppBar, ItemFilterInline } from '@ownclouders/web-pkg'
import SharedWithMeSection from '../../components/Shares/SharedWithMeSection.vue'
import { computed, defineComponent, ref, unref } from 'vue'
import { Resource } from '@ownclouders/web-client'
import SideBar from '../../components/SideBar/SideBar.vue'
import FilesViewWrapper from '../../components/FilesViewWrapper.vue'
import { useGetMatchingSpace, useSort } from '@ownclouders/web-pkg'
import { useGroupingSettings } from '@ownclouders/web-pkg'
import SharesNavigation from 'web-app-files/src/components/AppBar/SharesNavigation.vue'
import { useGettext } from 'vue3-gettext'
import { useStore } from '@ownclouders/web-pkg'

export default defineComponent({
  components: {
    SharesNavigation,
    FilesViewWrapper,
    AppBar,
    AppLoadingSpinner,
    SharedWithMeSection,
    SideBar,
    ItemFilterInline
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

    const visibilityOptions = computed(() => [
      { name: 'visible', label: $gettext('Shares') },
      { name: 'hidden', label: $gettext('Hidden Shares') }
    ])

    const setAreHiddenFilesShown = (value: InlineFilterOption) => {
      areHiddenFilesShown.value = value.name === 'hidden'
      store.dispatch('Files/resetFileSelection')
    }

    const visibleShares = computed(() => unref(storeItems).filter((r) => !r.hidden))
    const hiddenShares = computed(() => unref(storeItems).filter((r) => r.hidden))
    const currentItems = computed(() => {
      return unref(areHiddenFilesShown) ? unref(hiddenShares) : unref(visibleShares)
    })

    const { sortBy, sortDir, items, handleSort } = useSort({
      items: currentItems,
      fields: sortFields
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
      visibilityOptions,
      displayThumbnails,
      hiddenShares,
      setAreHiddenFilesShown,
      shareSectionTitle,
      visibleShares,

      handleSort,
      sortBy,
      sortDir,
      items,

      // CERN
      ...useGroupingSettings({ sortBy: sortBy, sortDir: sortDir })
    }
  },

  async created() {
    await this.loadResourcesTask.perform()
    this.scrollToResourceFromRoute(this.items, 'files-app-bar')
  }
})
</script>
