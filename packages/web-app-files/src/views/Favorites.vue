<template>
  <div class="oc-flex">
    <files-view-wrapper>
      <app-bar :view-modes="viewModes" :side-bar-open="sideBarOpen" />
      <app-loading-spinner v-if="areResourcesLoading" />
      <template v-else>
        <no-content-message
          v-if="isEmpty"
          id="files-favorites-empty"
          class="files-empty"
          icon="star"
        >
          <template #message>
            <span v-translate>There are no resources marked as favorite</span>
          </template>
        </no-content-message>
        <resource-table
          v-else
          id="files-favorites-table"
          v-model:selectedIds="selectedResourcesIds"
          class="files-table"
          :class="{ 'files-table-squashed': sideBarOpen }"
          :are-paths-displayed="true"
          :are-thumbnails-displayed="displayThumbnails"
          :resources="paginatedResources"
          :header-position="fileListHeaderY"
          :sort-by="sortBy"
          :sort-dir="sortDir"
          @file-click="triggerDefaultAction"
          @row-mounted="rowMounted"
          @sort="handleSort"
        >
          <template #quickActions="props">
            <quick-actions
              class="oc-visible@s"
              :item="props.resource"
              :actions="app.quickActions"
            />
          </template>
          <template #contextMenu="{ resource }">
            <context-actions
              v-if="isResourceInSelection(resource)"
              :action-options="{ space: getSpace(resource), resources: selectedResources }"
            />
          </template>
          <template #footer>
            <pagination :pages="paginationPages" :current-page="paginationPage" />
            <list-info
              v-if="paginatedResources.length > 0"
              class="oc-width-1-1 oc-my-s"
              :files="totalFilesCount.files"
              :folders="totalFilesCount.folders"
              :size="totalFilesSize"
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
import ResourceTable from '../components/FilesList/ResourceTable.vue'

import { useFileActions } from '../composables/actions/files/useFileActions'
import { VisibilityObserver } from 'web-pkg/src/observer'
import { ImageDimension, ImageType } from 'web-pkg/src/constants'
import { debounce } from 'lodash-es'

import AppBar from '../components/AppBar/AppBar.vue'
import QuickActions from '../components/FilesList/QuickActions.vue'
import AppLoadingSpinner from 'web-pkg/src/components/AppLoadingSpinner.vue'
import NoContentMessage from 'web-pkg/src/components/NoContentMessage.vue'
import ListInfo from '../components/FilesList/ListInfo.vue'
import Pagination from '../components/FilesList/Pagination.vue'
import ContextActions from '../components/FilesList/ContextActions.vue'
import { useResourcesViewDefaults, ViewModeConstants } from '../composables'
import { computed, defineComponent } from 'vue'
import { Resource } from 'web-client'
import SideBar from '../components/SideBar/SideBar.vue'
import FilesViewWrapper from '../components/FilesViewWrapper.vue'
import { useStore } from 'web-pkg/src/composables'
import { SpaceResource } from 'web-client/src/helpers'
import { getSpaceFromResource } from 'web-app-files/src/helpers/resource/getSpace'

const visibilityObserver = new VisibilityObserver()

export default defineComponent({
  components: {
    FilesViewWrapper,
    AppBar,
    ResourceTable,
    QuickActions,
    AppLoadingSpinner,
    Pagination,
    NoContentMessage,
    ListInfo,
    ContextActions,
    SideBar
  },

  setup() {
    const store = useStore()
    const getSpace = (resource: Resource): SpaceResource => {
      return getSpaceFromResource({ spaces: store.getters['runtime/spaces/spaces'], resource })
    }

    const viewModes = computed(() => [
      ViewModeConstants.condensedTable,
      ViewModeConstants.default,
      ViewModeConstants.tilesView
    ])

    return {
      ...useFileActions(),
      ...useResourcesViewDefaults<Resource, any, any[]>(),
      getSpace,
      viewModes
    }
  },

  computed: {
    ...mapState(['app']),
    ...mapState('Files', ['files']),
    ...mapGetters('Files', ['totalFilesCount', 'totalFilesSize']),
    ...mapGetters(['user', 'configuration']),

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
          space: this.getSpace(resource),
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
