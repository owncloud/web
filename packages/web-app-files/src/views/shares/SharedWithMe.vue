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
        <div class="oc-flex oc-m-m">
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
            v-if="shareTypes.length > 1"
            :allow-multiple="true"
            :filter-label="$gettext('Share Type')"
            :filterable-attributes="['label']"
            :items="shareTypes"
            :option-filter-label="$gettext('Filter share types')"
            :show-option-filter="true"
            id-attribute="key"
            class="share-type-filter oc-mx-s"
            display-name-attribute="label"
            filter-name="shareType"
          >
            <template #image="{ item }">
              <span class="oc-ml-s">{{ item.label }}</span>
            </template>
          </item-filter>
        </div>
        <shared-with-me-section
          id="files-shared-with-me-view"
          :display-thumbnails="displayThumbnails"
          :file-list-header-y="fileListHeaderY"
          :items="items"
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

import { AppLoadingSpinner, InlineFilterOption, ItemFilter } from '@ownclouders/web-pkg'
import { AppBar, ItemFilterInline } from '@ownclouders/web-pkg'
import { queryItemAsString, useRouteQuery } from '@ownclouders/web-pkg'
import SharedWithMeSection from '../../components/Shares/SharedWithMeSection.vue'
import { computed, defineComponent, onMounted, ref, unref } from 'vue'
import { Resource } from '@ownclouders/web-client'
import SideBar from '../../components/SideBar/SideBar.vue'
import FilesViewWrapper from '../../components/FilesViewWrapper.vue'
import { useGetMatchingSpace, useSort } from '@ownclouders/web-pkg'
import { useGroupingSettings } from '@ownclouders/web-pkg'
import SharesNavigation from 'web-app-files/src/components/AppBar/SharesNavigation.vue'
import { useGettext } from 'vue3-gettext'
import { useStore } from '@ownclouders/web-pkg'
import { useOpenWithDefaultApp } from '../../composables'
import { ShareTypes } from '@ownclouders/web-client/src/helpers'
import { uniq } from 'lodash-es'

export default defineComponent({
  components: {
    SharesNavigation,
    FilesViewWrapper,
    AppBar,
    AppLoadingSpinner,
    SharedWithMeSection,
    SideBar,
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

    const selectedShareTypesQuery = useRouteQuery('q_shareType')
    const filteredItems = computed(() => {
      const selectedShareTypes = queryItemAsString(unref(selectedShareTypesQuery))?.split('+')
      if (!selectedShareTypes || selectedShareTypes.length === 0) {
        return unref(currentItems)
      }
      return unref(currentItems).filter((item) => {
        return selectedShareTypes.map((t) => ShareTypes[t].value).includes(item.share.shareType)
      })
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

    onMounted(() => {
      performLoaderTask()
    })

    return {
      loadResourcesTask,
      areResourcesLoading,
      selectedResources,
      selectedResourcesIds,
      fileListHeaderY,
      sideBarOpen,
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
