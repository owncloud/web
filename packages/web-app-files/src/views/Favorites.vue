<template>
  <div class="oc-flex">
    <files-view-wrapper>
      <app-bar :display-view-mode-switch="true" :side-bar-open="sideBarOpen" />
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
          @file-click="$_fileActions_triggerDefaultAction"
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
              :items="selectedResources"
              :space="getSpace(resource)"
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

import FileActions from '../mixins/fileActions'
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
import { useResourcesViewDefaults } from '../composables'
import { defineComponent } from 'vue'
import { Resource } from 'web-client'
import SideBar from '../components/SideBar/SideBar.vue'
import FilesViewWrapper from '../components/FilesViewWrapper.vue'
import { useStore } from 'web-pkg/src/composables'
import { buildShareSpaceResource, SpaceResource } from 'web-client/src/helpers'
import { configurationManager } from 'web-pkg/src/configuration'
import { eventBus } from 'web-pkg/src/services/eventBus'

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

  mixins: [FileActions],

  setup() {
    const store = useStore()
    const getSpace = (resource: Resource): SpaceResource => {
      const storageId = resource.storageId
      // FIXME: Once we have the shareId in the OCS response, we can check for that and early return the share
      const space = store.getters['runtime/spaces/spaces'].find((space) => space.id === storageId)
      if (space) {
        return space
      }

      return buildShareSpaceResource({
        shareId: resource.shareId,
        shareName: resource.name,
        serverUrl: configurationManager.serverUrl
      })
    }

    return {
      ...useResourcesViewDefaults<Resource, any, any[]>(),
      getSpace
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

    this.loadResourcesEventToken = eventBus.subscribe(
      'app.files.list.removeFromFavorites',
      async () => {
        await this.loadResourcesTask.perform()
        this.scrollToResourceFromRoute(this.paginatedResources)
      }
    )
  },

  beforeUnmount() {
    visibilityObserver.disconnect()
    eventBus.unsubscribe('app.files.list.removeFromFavorites', this.loadResourcesEventToken)
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
          resource,
          isPublic: false,
          dimensions: ImageDimension.Thumbnail,
          type: ImageType.Thumbnail
        })
      }, 250)

      visibilityObserver.observe(component.$el, { onEnter: debounced, onExit: debounced.cancel })
    }
  }
})
</script>
