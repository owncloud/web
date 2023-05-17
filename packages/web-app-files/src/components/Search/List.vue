<template>
  <div class="files-search-result oc-flex">
    <files-view-wrapper>
      <app-bar :has-bulk-actions="false" :side-bar-open="sideBarOpen" />
      <div class="files-search-result-filter oc-flex oc-mx-m oc-mb-m">
        <div class="oc-mr-m oc-flex oc-flex-middle">
          <oc-icon name="filter-2" class="oc-mr-xs" />
          <span v-text="$gettext('Filter:')" />
        </div>
        <item-filter
          v-if="availableTags.length"
          ref="tagFilter"
          :allow-multiple="true"
          :filter-label="$gettext('Tags')"
          :filterable-attributes="['label']"
          :items="availableTags"
          :option-filter-label="$gettext('Filter tags')"
          :show-option-filter="true"
          class="files-search-filter-tags oc-mr-s"
          display-name-attribute="label"
          filter-name="tags"
        >
          <template #image="{ item }">
            <oc-avatar :width="24" :user-name="item.label" />
          </template>
          <template #item="{ item }">
            <span v-text="item.label" />
          </template>
        </item-filter>
        <item-filter-toggle
          :filter-label="$gettext('Search in file content')"
          filter-name="fulltext"
          class="files-search-filter-fulltext oc-mr-s"
        />
      </div>
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
          :header-position="fileListHeaderY"
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
import { computed, defineComponent, nextTick, onMounted, ref, unref, VNodeRef, watch } from 'vue'
import ListInfo from '../FilesList/ListInfo.vue'
import Pagination from '../FilesList/Pagination.vue'
import { useFileActions } from '../../composables/actions/files/useFileActions'
import { searchLimit } from '../../search/sdk/list'
import { Resource } from 'web-client'
import FilesViewWrapper from '../FilesViewWrapper.vue'
import SideBar from '../../components/SideBar/SideBar.vue'
import { buildShareSpaceResource, SpaceResource } from 'web-client/src/helpers'
import {
  queryItemAsString,
  useCapabilityFilesTags,
  useClientService,
  useFileListHeaderPosition,
  useRoute,
  useRouteQuery,
  useRouter,
  useStore
} from 'web-pkg/src/composables'
import { configurationManager } from 'web-pkg/src/configuration'
import { basename } from 'path'
import { onBeforeRouteLeave } from 'vue-router'
import { useTask } from 'vue-concurrency'
import { eventBus } from 'web-pkg'
import ItemFilter from 'web-pkg/src/components/ItemFilter.vue'
import { isLocationCommonActive } from 'web-app-files/src/router'
import ItemFilterToggle from 'web-pkg/src/components/ItemFilterToggle.vue'

const visibilityObserver = new VisibilityObserver()

type Tag = {
  id: string
  label: string
}

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
    FilesViewWrapper,
    ItemFilter,
    ItemFilterToggle
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
  emits: ['search'],
  setup(props, { emit }) {
    const store = useStore()
    const router = useRouter()
    const route = useRoute()
    const { y: fileListHeaderY } = useFileListHeaderPosition()
    const clientService = useClientService()
    const hasTags = useCapabilityFilesTags()

    const searchTermQuery = useRouteQuery('term')
    const searchTerm = computed(() => {
      return queryItemAsString(unref(searchTermQuery))
    })

    const availableTags = ref<Tag[]>([])
    const tagFilter = ref<VNodeRef>()
    const tagParam = useRouteQuery('q_tags')
    const fulltextParam = useRouteQuery('q_fulltext')

    const loadAvailableTagsTask = useTask(function* () {
      const {
        data: { value: tags = [] }
      } = yield clientService.graphAuthenticated.tags.getTags()
      availableTags.value = [...tags.map((t) => ({ id: t, label: t }))]
    })

    onBeforeRouteLeave(() => {
      eventBus.publish('app.search.term.clear')
    })
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

    const buildSearchTerm = (manuallyUpdateFilterChip = false) => {
      let term = unref(searchTerm)

      const fulltext = queryItemAsString(unref(fulltextParam))
      if (fulltext) {
        term = `Content:"${term}"`
      }

      const tags = queryItemAsString(unref(tagParam))
      if (tags) {
        const tagsTerm = tags.split('+')?.join(',') || ''
        term += ` Tags:"${unref(tagsTerm)}"`
        if (manuallyUpdateFilterChip && unref(tagFilter)) {
          /**
           * Handles edge cases where a filter is not being applied via the filter directly,
           * e.g. when clicking on a tag in the files list.
           * We need to manually update the selected items in the ItemFilter component because normally
           * it only does this on mount or when interacting with the filter directly.
           */
          ;(unref(tagFilter) as any).setSelectedItemsBasedOnQuery()
        }
      }

      return term
    }

    onMounted(async () => {
      if (unref(hasTags)) {
        await loadAvailableTagsTask.perform()
      }
      emit('search', buildSearchTerm())
    })

    watch(
      () => unref(route).query,
      (newVal, oldVal) => {
        const filters = ['q_fulltext', 'q_tags']
        const isChange =
          newVal?.term !== oldVal?.term || filters.some((f) => newVal[f] ?? '' !== oldVal[f] ?? '')

        if (isChange && isLocationCommonActive(router, 'files-common-search')) {
          emit('search', buildSearchTerm(true))
        }
      },
      { deep: true }
    )

    return {
      ...useFileActions({ store }),
      ...useResourcesViewDefaults<Resource, any, any[]>(),
      loadAvailableTagsTask,
      fileListHeaderY,
      getSpace,
      availableTags,
      tagFilter
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
<style lang="scss">
.files-search-result .files-app-bar-actions {
  display: none !important;
}
</style>
