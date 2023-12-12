<template>
  <div class="oc-flex">
    <files-view-wrapper class="oc-flex-column">
      <app-bar :has-bulk-actions="true" :is-side-bar-open="isSideBarOpen">
        <template #navigation>
          <SharesNavigation />
        </template>
      </app-bar>
      <app-loading-spinner v-if="areResourcesLoading" />
      <template v-else>
        <div
          class="shared-with-me-filters oc-flex oc-flex-between oc-flex-wrap oc-flex-bottom oc-mx-m oc-mb-m"
        >
          <div class="oc-flex">
            <div class="oc-mr-m oc-flex oc-flex-middle">
              <oc-icon name="filter-2" class="oc-mr-xs" />
              <span v-text="$gettext('Filter:')" />
            </div>
            <item-filter-inline
              class="share-visibility-filter"
              filter-name="share-visibility"
              :filter-options="visibilityOptions"
              @toggle-filter="setAreHiddenFilesShown"
            />
            <item-filter
              :allow-multiple="true"
              :filter-label="$gettext('Share Type')"
              :filterable-attributes="['label']"
              :items="shareTypes"
              :option-filter-label="$gettext('Filter share types')"
              :show-option-filter="true"
              id-attribute="key"
              class="share-type-filter oc-ml-s"
              display-name-attribute="label"
              filter-name="shareType"
            >
              <template #item="{ item }">
                <span class="oc-ml-s" v-text="item.label" />
              </template>
            </item-filter>
            <item-filter
              :allow-multiple="true"
              :filter-label="$gettext('Shared By')"
              :filterable-attributes="['displayName']"
              :items="fileOwners"
              :option-filter-label="$gettext('Filter shared by')"
              :show-option-filter="true"
              id-attribute="username"
              class="shared-by-filter oc-ml-s"
              display-name-attribute="displayName"
              filter-name="sharedBy"
            >
              <template #image="{ item }">
                <avatar-image :width="32" :userid="item.username" :user-name="item.displayName" />
              </template>
              <template #item="{ item }">
                <span class="oc-ml-s" v-text="item.displayName" />
              </template>
            </item-filter>
          </div>
          <div>
            <oc-text-input
              v-model="filterTerm"
              class="search-filter"
              :label="$gettext('Search')"
              autocomplete="off"
            />
          </div>
        </div>
        <shared-with-me-section
          id="files-shared-with-me-view"
          :display-thumbnails="displayThumbnails"
          :file-list-header-y="fileListHeaderY"
          :items="items"
          :is-side-bar-open="isSideBarOpen"
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
    <file-side-bar
      :is-open="isSideBarOpen"
      :active-panel="sideBarActivePanel"
      :space="selectedShareSpace"
    />
  </div>
</template>

<script lang="ts">
import Fuse from 'fuse.js'
import Mark from 'mark.js'
import { useResourcesViewDefaults } from '../../composables'

import {
  AppLoadingSpinner,
  FileSideBar,
  InlineFilterOption,
  ItemFilter
} from '@ownclouders/web-pkg'
import { AppBar, ItemFilterInline } from '@ownclouders/web-pkg'
import { queryItemAsString, useRouteQuery } from '@ownclouders/web-pkg'
import SharedWithMeSection from '../../components/Shares/SharedWithMeSection.vue'
import { computed, defineComponent, onMounted, ref, unref, watch } from 'vue'
import { Resource } from '@ownclouders/web-client'
import FilesViewWrapper from '../../components/FilesViewWrapper.vue'
import { useGetMatchingSpace, useSort } from '@ownclouders/web-pkg'
import { useGroupingSettings } from '@ownclouders/web-pkg'
import SharesNavigation from 'web-app-files/src/components/AppBar/SharesNavigation.vue'
import { useGettext } from 'vue3-gettext'
import { useStore, useOpenWithDefaultApp, defaultFuseOptions } from '@ownclouders/web-pkg'
import { ShareTypes } from '@ownclouders/web-client/src/helpers'
import { uniq } from 'lodash-es'

export default defineComponent({
  components: {
    SharesNavigation,
    FilesViewWrapper,
    AppBar,
    AppLoadingSpinner,
    SharedWithMeSection,
    FileSideBar,
    ItemFilterInline,
    ItemFilter
  },

  setup() {
    const { openWithDefaultApp } = useOpenWithDefaultApp()

    const {
      areResourcesLoading,
      sortFields,
      fileListHeaderY,
      loadResourcesTask,
      selectedResources,
      selectedResourcesIds,
      sideBarActivePanel,
      isSideBarOpen,
      storeItems,
      scrollToResourceFromRoute
    } = useResourcesViewDefaults<Resource, any, any[]>()

    const { $gettext } = useGettext()

    const areHiddenFilesShown = ref(false)
    const filterTerm = ref('')
    const markInstance = ref<Mark>()

    const shareSectionTitle = computed(() => {
      return unref(areHiddenFilesShown) ? $gettext('Hidden Shares') : $gettext('Shares')
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

    const selectedShareTypesQuery = useRouteQuery('q_shareType')
    const selectedSharedByQuery = useRouteQuery('q_sharedBy')
    const filteredItems = computed(() => {
      let result = unref(currentItems)

      const selectedShareTypes = queryItemAsString(unref(selectedShareTypesQuery))?.split('+')
      if (selectedShareTypes?.length) {
        result = result.filter(({ share }) => {
          return selectedShareTypes.map((t) => ShareTypes[t].value).includes(share.shareType)
        })
      }

      const selectedSharedBy = queryItemAsString(unref(selectedSharedByQuery))?.split('+')
      if (selectedSharedBy?.length) {
        result = result.filter(({ owner }) =>
          owner.some(({ username }) => selectedSharedBy.includes(username))
        )
      }

      if (unref(filterTerm).trim()) {
        const usersSearchEngine = new Fuse(result, { ...defaultFuseOptions, keys: ['name'] })
        const fuseResult = usersSearchEngine.search(unref(filterTerm)).map((r) => r.item)
        result = fuseResult.filter((item) => result.includes(item))
      }

      return result
    })

    watch(filteredItems, () => {
      if (!unref(areResourcesLoading)) {
        if (!unref(markInstance)) {
          markInstance.value = new Mark('.oc-resource-details')
        }

        unref(markInstance).unmark()
        unref(markInstance).mark(unref(filterTerm), {
          element: 'span',
          className: 'mark-highlight'
        })
      }
    })

    const { sortBy, sortDir, items, handleSort } = useSort({
      items: filteredItems,
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

    const openWithDefaultAppQuery = useRouteQuery('openWithDefaultApp')
    const performLoaderTask = async () => {
      await loadResourcesTask.perform()
      scrollToResourceFromRoute(unref(items), 'files-app-bar')
      if (queryItemAsString(unref(openWithDefaultAppQuery)) === 'true') {
        openWithDefaultApp({
          space: unref(selectedShareSpace),
          resource: unref(selectedResources)[0]
        })
      }
    }

    const shareTypes = computed(() => {
      const uniqueShareTypes = uniq(unref(storeItems).map((i) => i.share?.shareType))
      return ShareTypes.getByValues(uniqueShareTypes)
    })

    const fileOwners = computed(() => {
      const flatList = unref(storeItems)
        .map((i) => i.owner)
        .flat()
      return [...new Map(flatList.map((item) => [item.username, item])).values()]
    })

    onMounted(() => {
      performLoaderTask()
    })

    return {
      loadResourcesTask,
      areResourcesLoading,
      selectedResources,
      selectedResourcesIds,
      fileListHeaderY,
      isSideBarOpen,
      sideBarActivePanel,
      selectedShareSpace,

      areHiddenFilesShown,
      visibilityOptions,
      displayThumbnails,
      hiddenShares,
      setAreHiddenFilesShown,
      shareSectionTitle,
      visibleShares,
      shareTypes,
      fileOwners,
      filterTerm,

      handleSort,
      sortBy,
      sortDir,
      items,

      // CERN
      ...useGroupingSettings({ sortBy: sortBy, sortDir: sortDir })
    }
  }
})
</script>

<style lang="scss" scoped>
.search-filter {
  width: 16rem;
}
</style>
