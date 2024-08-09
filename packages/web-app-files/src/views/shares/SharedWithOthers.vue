<template>
  <div class="oc-flex">
    <files-view-wrapper>
      <app-bar :is-side-bar-open="isSideBarOpen">
        <template #navigation>
          <SharesNavigation />
        </template>
      </app-bar>
      <app-loading-spinner v-if="areResourcesLoading" />
      <template v-else>
        <div v-if="shareTypes.length > 1" class="oc-flex oc-m-m">
          <div class="oc-mr-m oc-flex oc-flex-middle">
            <oc-icon name="filter-2" class="oc-mr-xs" />
            <span v-text="$gettext('Filter:')" />
          </div>
          <item-filter
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
            <template #item="{ item }">
              <span class="oc-ml-s" v-text="item.label" />
            </template>
          </item-filter>
        </div>
        <no-content-message
          v-if="isEmpty"
          id="files-shared-with-others-empty"
          class="files-empty"
          icon="reply"
        >
          <template #message>
            <span v-translate> You have not shared any resources with other people. </span>
          </template>
        </no-content-message>
        <resource-table
          v-else
          v-model:selectedIds="selectedResourcesIds"
          :is-side-bar-open="isSideBarOpen"
          :fields-displayed="['name', 'sharedWith', 'sdate']"
          :are-paths-displayed="true"
          :resources="filteredItems"
          :header-position="fileListHeaderY"
          :sort-by="sortBy"
          :sort-dir="sortDir"
          :grouping-settings="groupingSettings"
          @file-click="triggerDefaultAction"
          @row-mounted="rowMounted"
          @sort="handleSort"
        >
          <template #contextMenu="{ resource }">
            <context-actions
              v-if="isResourceInSelection(resource)"
              :action-options="{ space: getMatchingSpace(resource), resources: selectedResources }"
            />
          </template>
          <template #footer>
            <pagination :pages="paginationPages" :current-page="paginationPage" />
            <list-info v-if="filteredItems.length > 0" class="oc-width-1-1 oc-my-s" />
          </template>
        </resource-table>
      </template>
    </files-view-wrapper>
    <file-side-bar
      :is-open="isSideBarOpen"
      :active-panel="sideBarActivePanel"
      :space="selectedResourceSpace"
    />
  </div>
</template>

<script lang="ts">
import {
  queryItemAsString,
  useAppsStore,
  useCapabilityStore,
  useConfigStore,
  useFileActions,
  useResourcesStore,
  useRouteQuery
} from '@ownclouders/web-pkg'
import { VisibilityObserver, ItemFilter } from '@ownclouders/web-pkg'
import { ImageDimension } from '@ownclouders/web-pkg'
import { debounce, uniq } from 'lodash-es'

import { FileSideBar, ResourceTable } from '@ownclouders/web-pkg'
import { AppLoadingSpinner } from '@ownclouders/web-pkg'
import { NoContentMessage } from '@ownclouders/web-pkg'
import { AppBar } from '@ownclouders/web-pkg'
import ListInfo from '../../components/FilesList/ListInfo.vue'
import { Pagination } from '@ownclouders/web-pkg'
import { ContextActions } from '@ownclouders/web-pkg'
import FilesViewWrapper from '../../components/FilesViewWrapper.vue'

import { useResourcesViewDefaults } from '../../composables'
import { defineComponent, computed, unref, ComponentPublicInstance } from 'vue'
import { Resource } from '@ownclouders/web-client'
import { useGroupingSettings } from '@ownclouders/web-pkg'
import { useGetMatchingSpace } from '@ownclouders/web-pkg'
import SharesNavigation from 'web-app-files/src/components/AppBar/SharesNavigation.vue'
import { OutgoingShareResource, ShareTypes } from '@ownclouders/web-client'
import { storeToRefs } from 'pinia'

const visibilityObserver = new VisibilityObserver()

export default defineComponent({
  components: {
    SharesNavigation,
    FilesViewWrapper,
    AppBar,
    FileSideBar,
    ResourceTable,
    AppLoadingSpinner,
    NoContentMessage,
    ListInfo,
    Pagination,
    ContextActions,
    ItemFilter
  },

  setup() {
    const capabilityStore = useCapabilityStore()
    const { getMatchingSpace } = useGetMatchingSpace()
    const configStore = useConfigStore()
    const appsStore = useAppsStore()
    const { options: configOptions } = storeToRefs(configStore)

    const resourcesStore = useResourcesStore()
    const { updateResourceField } = resourcesStore

    const resourcesViewDefaults = useResourcesViewDefaults<OutgoingShareResource, any, any[]>()
    const { sortBy, sortDir, loadResourcesTask, selectedResourcesIds, paginatedResources } =
      resourcesViewDefaults

    const shareTypes = computed(() => {
      const uniqueShareTypes = uniq(unref(paginatedResources).flatMap((i) => i.shareTypes))

      const ocmAvailable = appsStore.appIds.includes('open-cloud-mesh')
      if (ocmAvailable && !uniqueShareTypes.includes(ShareTypes.remote.value)) {
        uniqueShareTypes.push(ShareTypes.remote.value)
      }

      return ShareTypes.getByValues(uniqueShareTypes)
    })
    const selectedShareTypesQuery = useRouteQuery('q_shareType')
    const filteredItems = computed(() => {
      const selectedShareTypes = queryItemAsString(unref(selectedShareTypesQuery))?.split('+')
      if (!selectedShareTypes || selectedShareTypes.length === 0) {
        return unref(paginatedResources)
      }
      return unref(paginatedResources).filter((item) => {
        return ShareTypes.getByKeys(selectedShareTypes)
          .map(({ value }) => value)
          .some((t) => item.shareTypes.includes(t))
      })
    })

    resourcesStore.$onAction((action) => {
      if (action.name !== 'updateResourceField') {
        return
      }

      if (selectedResourcesIds.value.length !== 1) return
      const id = selectedResourcesIds.value[0]

      const match = unref(paginatedResources).find((r) => {
        return r.id === id
      })
      if (!match) return

      loadResourcesTask.perform()

      const matchedNewResource = unref(paginatedResources).find((r) => r.fileId === match.fileId)
      if (!matchedNewResource) return

      selectedResourcesIds.value = [matchedNewResource.id]
    })

    return {
      ...useFileActions(),
      ...resourcesViewDefaults,
      configStore,
      configOptions,
      capabilityStore,
      filteredItems,
      shareTypes,
      getMatchingSpace,
      updateResourceField,

      // CERN
      ...useGroupingSettings({ sortBy, sortDir })
    }
  },

  computed: {
    isEmpty() {
      return this.filteredItems.length < 1
    }
  },

  async created() {
    await this.loadResourcesTask.perform()
    this.scrollToResourceFromRoute(this.filteredItems, 'files-app-bar')
  },

  beforeUnmount() {
    visibilityObserver.disconnect()
  },

  methods: {
    rowMounted(resource: Resource, component: ComponentPublicInstance<unknown>) {
      const loadPreview = async () => {
        const preview = await this.$previewService.loadPreview(
          {
            space: this.getMatchingSpace(resource),
            resource,
            dimensions: ImageDimension.Thumbnail
          },
          true
        )
        if (preview) {
          this.updateResourceField({ id: resource.id, field: 'thumbnail', value: preview })
        }
      }

      const debounced = debounce(({ unobserve }) => {
        unobserve()
        loadPreview()
      }, 250)

      visibilityObserver.observe(component.$el, { onEnter: debounced, onExit: debounced.cancel })
    }
  }
})
</script>
