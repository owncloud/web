<template>
  <div class="files-search-result oc-flex">
    <files-view-wrapper>
      <app-bar :has-bulk-actions="false" :side-bar-open="sideBarOpen" />
      <app-loading-spinner v-if="loading" />
      <template v-else>
        <no-content-message
          v-if="!paginatedResources.length"
          class="files-empty"
          icon="search"
          icon-fill-type="line"
        >
          <template #message>
            <p class="oc-text-muted">
              <span v-if="!!$route.query.term" v-translate>No results found</span>
              <span v-else v-translate>No search term entered</span>
            </p>
          </template>
        </no-content-message>
        <resource-table
          v-else
          v-model:selectedIds="selectedResourcesIds"
          class="files-table"
          :class="{ 'files-table-squashed': false }"
          :resources="paginatedResources"
          :are-paths-displayed="true"
          :are-thumbnails-displayed="displayThumbnails"
          :has-actions="true"
          :is-selectable="false"
          :sort-by="sortBy"
          :sort-dir="sortDir"
          @file-click="triggerDefaultAction"
          @row-mounted="rowMounted"
          @sort="handleSort"
        >
          <template #contextMenu="{ resource }">
            <context-actions
              v-if="isResourceInSelection(resource)"
              :action-options="{ space: getSpace(resource), resources: selectedResources }"
            />
          </template>
          <template #footer>
            <pagination :pages="paginationPages" :current-page="paginationPage" />
            <div
              v-if="searchResultExceedsLimit"
              class="oc-text-nowrap oc-text-center oc-width-1-1 oc-my-s"
              v-text="searchResultExceedsLimitText"
            />
            <list-info
              v-else-if="paginatedResources.length > 0"
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
import { useResourcesViewDefaults } from '../../composables'
import AppLoadingSpinner from 'web-pkg/src/components/AppLoadingSpinner.vue'
import { VisibilityObserver } from 'web-pkg/src/observer'
import { ImageType, ImageDimension } from 'web-pkg/src/constants'
import NoContentMessage from 'web-pkg/src/components/NoContentMessage.vue'
import ResourceTable from '../FilesList/ResourceTable.vue'
import ContextActions from '../FilesList/ContextActions.vue'
import { debounce } from 'lodash-es'
import { mapMutations, mapGetters, mapActions } from 'vuex'
import AppBar from '../AppBar/AppBar.vue'
import { defineComponent, nextTick } from 'vue'
import ListInfo from '../FilesList/ListInfo.vue'
import Pagination from '../FilesList/Pagination.vue'
import { useFileActions } from '../../composables/actions/files/useFileActions'
import { searchLimit } from '../../search/sdk/list'
import { Resource } from 'web-client'
import FilesViewWrapper from '../FilesViewWrapper.vue'
import SideBar from '../../components/SideBar/SideBar.vue'
import { buildShareSpaceResource, SpaceResource } from 'web-client/src/helpers'
import { useStore } from 'web-pkg/src/composables'
import { configurationManager } from 'web-pkg/src/configuration'
import { basename } from 'path'

const visibilityObserver = new VisibilityObserver()

export default defineComponent({
  components: {
    AppBar,
    SideBar,
    AppLoadingSpinner,
    ContextActions,
    ListInfo,
    Pagination,
    NoContentMessage,
    ResourceTable,
    FilesViewWrapper
  },
  props: {
    searchResult: {
      type: Object,
      default: function () {
        return { totalResults: null, values: [] }
      }
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  setup() {
    const store = useStore()
    const getSpace = (resource: Resource): SpaceResource => {
      if (resource.shareId) {
        return buildShareSpaceResource({
          shareId: resource.shareId,
          shareName: basename(resource.shareRoot),
          serverUrl: configurationManager.serverUrl
        })
      }
      return store.getters['runtime/spaces/spaces'].find((space) => space.id === resource.storageId)
    }

    return {
      ...useFileActions({ store }),
      ...useResourcesViewDefaults<Resource, any, any[]>(),
      getSpace
    }
  },
  computed: {
    ...mapGetters(['configuration']),
    ...mapGetters('Files', ['totalFilesCount', 'totalFilesSize']),
    displayThumbnails() {
      return !this.configuration?.options?.disablePreviews
    },
    itemCount() {
      return this.totalFilesCount.files + this.totalFilesCount.folders
    },
    rangeSupported() {
      return this.searchResult.totalResults
    },
    searchResultExceedsLimit() {
      return (
        !this.rangeSupported ||
        (this.searchResult.totalResults && this.searchResult.totalResults > searchLimit)
      )
    },
    searchResultExceedsLimitText() {
      if (!this.rangeSupported) {
        const translated = this.$gettext('Showing up to %{searchLimit} results')
        return this.$gettextInterpolate(translated, {
          searchLimit
        })
      }

      const translated = this.$gettext(
        'Found %{totalResults}, showing the %{itemCount} best matching results'
      )
      return this.$gettextInterpolate(translated, {
        itemCount: this.itemCount,
        totalResults: this.searchResult.totalResults
      })
    }
  },
  watch: {
    searchResult: {
      handler: async function () {
        if (!this.searchResult) {
          return
        }

        this.CLEAR_CURRENT_FILES_LIST()
        this.LOAD_FILES({
          currentFolder: null,
          files: this.searchResult.values.length
            ? this.searchResult.values.map((searchResult) => searchResult.data)
            : []
        })
        await nextTick()
        this.scrollToResourceFromRoute(this.paginatedResources)
      }
    }
  },
  beforeUnmount() {
    visibilityObserver.disconnect()
  },
  methods: {
    ...mapMutations('Files', ['CLEAR_CURRENT_FILES_LIST', 'LOAD_FILES']),
    ...mapActions('Files', ['loadPreview']),
    rowMounted(resource, component) {
      if (!this.displayThumbnails) {
        return
      }

      const debounced = debounce(({ unobserve }) => {
        unobserve()
        this.loadPreview({
          clientService: this.$clientService,
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
