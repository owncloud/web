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
          id="files-shared-via-link-table"
          v-model:selectedIds="selectedResourcesIds"
          class="files-table"
          :class="{ 'files-table-squashed': isSideBarOpen }"
          :fields-displayed="['name', 'sharedWith', 'sdate']"
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
            <list-info
              v-if="paginatedResources.length > 0"
              class="oc-width-1-1 oc-my-s"
              :files="totalFilesCount.files"
              :folders="totalFilesCount.folders"
              :spaces="totalFilesCount.spaces"
              :show-spaces="hasProjectSpaces"
            />
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
import { mapGetters, mapState, mapActions } from 'vuex'

import { FileSideBar, useFileActions } from '@ownclouders/web-pkg'
import { VisibilityObserver } from '@ownclouders/web-pkg'
import { ImageDimension, ImageType } from '@ownclouders/web-pkg'
import { debounce, find } from 'lodash-es'

import { AppLoadingSpinner } from '@ownclouders/web-pkg'
import { NoContentMessage } from '@ownclouders/web-pkg'
import { AppBar } from '@ownclouders/web-pkg'
import ListInfo from '../../components/FilesList/ListInfo.vue'
import { ContextActions } from '@ownclouders/web-pkg'
import FilesViewWrapper from '../../components/FilesViewWrapper.vue'
import { ResourceTable } from '@ownclouders/web-pkg'
import { Pagination } from '@ownclouders/web-pkg'

import { useResourcesViewDefaults } from '../../composables'
import { defineComponent } from 'vue'
import { Resource } from '@ownclouders/web-client'
import {
  useCapabilityProjectSpacesEnabled,
  useGetMatchingSpace,
  useMutationSubscription
} from '@ownclouders/web-pkg'
import SharesNavigation from 'web-app-files/src/components/AppBar/SharesNavigation.vue'

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
    const { getMatchingSpace } = useGetMatchingSpace()

    const { loadResourcesTask, selectedResourcesIds, paginatedResources } =
      useResourcesViewDefaults<Resource, any, any[]>()

    useMutationSubscription(['Files/UPDATE_RESOURCE_FIELD'], async (mutation) => {
      if (mutation.payload.field === 'shareTypes') {
        if (selectedResourcesIds.value.length !== 1) return
        const id = selectedResourcesIds.value[0]

        const match = find(paginatedResources.value, { id })
        if (!match) return

        await loadResourcesTask.perform()

        const matchedNewResource = find(paginatedResources.value, { fileId: match.fileId })
        if (!matchedNewResource) return

        selectedResourcesIds.value = [matchedNewResource.id]
      }
    })

    return {
      ...useFileActions(),
      ...useResourcesViewDefaults<Resource, any, any[]>(),
      getMatchingSpace,
      hasProjectSpaces: useCapabilityProjectSpacesEnabled()
    }
  },

  computed: {
    ...mapState(['app']),
    ...mapGetters('Files', ['totalFilesCount']),
    ...mapGetters(['configuration']),

    helpersEnabled() {
      return this.configuration?.options?.contextHelpers
    },

    isEmpty() {
      return this.paginatedResources.length < 1
    },

    displayThumbnails() {
      return !this.configuration?.options?.disablePreviews
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
    ...mapActions('Files', ['loadPreview']),

    rowMounted(resource, component) {
      if (!this.displayThumbnails) {
        return
      }

      const debounced = debounce(({ unobserve }) => {
        unobserve()
        this.loadPreview({
          previewService: this.$previewService,
          space: this.getMatchingSpace(resource),
          resource,
          dimensions: ImageDimension.Thumbnail,
          type: ImageType.Thumbnail
        })
      }, 250)

      visibilityObserver.observe(component.$el, { onEnter: debounced, onExit: debounced.cancel })
    }
  }
})
</script>
