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
        <no-content-message
          v-if="isEmpty"
          id="files-shared-via-link-empty"
          class="files-empty"
          icon="link"
        >
          <template #message>
            <span v-translate>You have not shared any resource via link.</span>
          </template>
        </no-content-message>
        <resource-table
          v-else
          v-model:selectedIds="selectedResourcesIds"
          :is-side-bar-open="isSideBarOpen"
          :fields-displayed="['name', 'sdate']"
          :are-thumbnails-displayed="displayThumbnails"
          :are-paths-displayed="true"
          :resources="paginatedResources"
          :header-position="fileListHeaderY"
          :sort-by="sortBy"
          :sort-dir="sortDir"
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
            <list-info v-if="paginatedResources.length > 0" class="oc-width-1-1 oc-my-s" />
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
  FileSideBar,
  useCapabilityStore,
  useConfigStore,
  useFileActions,
  useResourcesStore
} from '@ownclouders/web-pkg'
import { VisibilityObserver } from '@ownclouders/web-pkg'
import { ImageDimension } from '@ownclouders/web-pkg'
import { debounce } from 'lodash-es'

import { AppLoadingSpinner } from '@ownclouders/web-pkg'
import { NoContentMessage } from '@ownclouders/web-pkg'
import { AppBar } from '@ownclouders/web-pkg'
import ListInfo from '../../components/FilesList/ListInfo.vue'
import { ContextActions } from '@ownclouders/web-pkg'
import FilesViewWrapper from '../../components/FilesViewWrapper.vue'
import { ResourceTable } from '@ownclouders/web-pkg'
import { Pagination } from '@ownclouders/web-pkg'

import { useResourcesViewDefaults } from '../../composables'
import { ComponentPublicInstance, defineComponent, unref } from 'vue'
import { Resource } from '@ownclouders/web-client'
import { useGetMatchingSpace } from '@ownclouders/web-pkg'
import SharesNavigation from 'web-app-files/src/components/AppBar/SharesNavigation.vue'
import { storeToRefs } from 'pinia'
import { OutgoingShareResource } from '@ownclouders/web-client'

const visibilityObserver = new VisibilityObserver()

export default defineComponent({
  components: {
    SharesNavigation,
    FilesViewWrapper,
    AppBar,
    ResourceTable,
    AppLoadingSpinner,
    NoContentMessage,
    ListInfo,
    Pagination,
    ContextActions,
    FileSideBar
  },

  setup() {
    const capabilityStore = useCapabilityStore()
    const capabilityRefs = storeToRefs(capabilityStore)
    const { getMatchingSpace } = useGetMatchingSpace()
    const configStore = useConfigStore()
    const { options: configOptions } = storeToRefs(configStore)

    const resourcesStore = useResourcesStore()
    const { updateResourceField } = resourcesStore
    const { totalResourcesCount } = storeToRefs(resourcesStore)

    const { loadResourcesTask, selectedResourcesIds, paginatedResources } =
      useResourcesViewDefaults<OutgoingShareResource, any, any[]>()

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
      ...useResourcesViewDefaults<Resource, any, any[]>(),
      configOptions,
      getMatchingSpace,
      totalResourcesCount,
      updateResourceField,
      hasProjectSpaces: capabilityRefs.spacesProjects
    }
  },

  computed: {
    helpersEnabled() {
      return this.configOptions.contextHelpers
    },

    isEmpty() {
      return this.paginatedResources.length < 1
    },

    displayThumbnails() {
      return !this.configOptions.disablePreviews
    }
  },

  async created() {
    await this.loadResourcesTask.perform()
    this.scrollToResourceFromRoute(this.paginatedResources, 'files-app-bar')
  },

  beforeUnmount() {
    visibilityObserver.disconnect()
  },

  methods: {
    rowMounted(resource: Resource, component: ComponentPublicInstance<unknown>) {
      if (!this.displayThumbnails) {
        return
      }

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
