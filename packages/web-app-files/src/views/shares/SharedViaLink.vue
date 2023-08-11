<template>
  <div class="oc-flex">
    <files-view-wrapper>
      <app-bar :has-shares-navigation="true" :side-bar-open="sideBarOpen" />
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
          :class="{ 'files-table-squashed': sideBarOpen }"
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
    <side-bar
      :open="sideBarOpen"
      :active-panel="sideBarActivePanel"
      :space="selectedResourceSpace"
    />
  </div>
</template>

<script lang="ts">
import { mapGetters, mapState, mapActions } from 'vuex'

import { useFileActions } from '../../composables/actions/files/useFileActions'
import { VisibilityObserver } from 'web-pkg/src/observer'
import { ImageDimension, ImageType } from 'web-pkg/src/constants'
import { debounce, find } from 'lodash-es'

import AppLoadingSpinner from 'web-pkg/src/components/AppLoadingSpinner.vue'
import NoContentMessage from 'web-pkg/src/components/NoContentMessage.vue'
import AppBar from '../../components/AppBar/AppBar.vue'
import ListInfo from '../../components/FilesList/ListInfo.vue'
import ContextActions from '../../components/FilesList/ContextActions.vue'
import SideBar from '../../components/SideBar/SideBar.vue'
import FilesViewWrapper from '../../components/FilesViewWrapper.vue'
import ResourceTable from '../../components/FilesList/ResourceTable.vue'
import Pagination from 'web-pkg/src/components/Pagination.vue'

import { useResourcesViewDefaults } from '../../composables'
import { defineComponent } from 'vue'
import { Resource } from 'web-client'
import {
  useCapabilityProjectSpacesEnabled,
  useGetMatchingSpace,
  useMutationSubscription
} from 'web-pkg/src/composables'

const visibilityObserver = new VisibilityObserver()

export default defineComponent({
  components: {
    FilesViewWrapper,
    AppBar,
    ResourceTable,
    AppLoadingSpinner,
    NoContentMessage,
    ListInfo,
    Pagination,
    ContextActions,
    SideBar
  },

  setup() {
    const resourceViewDefaults = useResourcesViewDefaults<Resource, any, any[]>()
    const { loadResourcesTask, selectedResourcesIds, paginatedResources } = resourceViewDefaults

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
      ...resourceViewDefaults,
      ...useGetMatchingSpace(),
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
    this.scrollToResourceFromRoute(this.paginatedResources)
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
