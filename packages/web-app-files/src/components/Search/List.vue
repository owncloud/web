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
          v-model="selectedResourcesIds"
          class="files-table"
          :class="{ 'files-table-squashed': false }"
          :resources="paginatedResources"
          :target-route="resourceTargetLocation"
          :are-paths-displayed="true"
          :are-thumbnails-displayed="displayThumbnails"
          :has-actions="true"
          :is-selectable="false"
          @fileClick="$_fileActions_triggerDefaultAction"
          @rowMounted="rowMounted"
        >
          <template #contextMenu="{ resource }">
            <context-actions v-if="isResourceInSelection(resource)" :items="selectedResources" />
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
    <side-bar :open="sideBarOpen" :active-panel="sideBarActivePanel" />
  </div>
</template>

<script lang="ts">
import { useResourcesViewDefaults } from '../../composables'
import AppLoadingSpinner from 'web-pkg/src/components/AppLoadingSpinner.vue'
import { VisibilityObserver } from 'web-pkg/src/observer'
import { ImageType, ImageDimension } from '../../constants'
import { createLocationSpaces } from '../../router'
import NoContentMessage from 'web-pkg/src/components/NoContentMessage.vue'
import ResourceTable from '../FilesList/ResourceTable.vue'
import ContextActions from '../FilesList/ContextActions.vue'
import debounce from 'lodash-es/debounce'
import { mapMutations, mapGetters, mapActions } from 'vuex'
import AppBar from '../AppBar/AppBar.vue'
import { defineComponent } from '@vue/composition-api'
import ListInfo from '../FilesList/ListInfo.vue'
import Pagination from '../FilesList/Pagination.vue'
import MixinFileActions from '../../mixins/fileActions'
import MixinFilesListFilter from '../../mixins/filesListFilter'
import MixinFilesListScrolling from '../../mixins/filesListScrolling'
import { searchLimit } from '../../search/sdk/list'
import { Resource } from 'web-client'
import { useStore } from 'web-pkg/src/composables'
import FilesViewWrapper from '../FilesViewWrapper.vue'
import SideBar from '../../components/SideBar/SideBar.vue'

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
  mixins: [MixinFileActions, MixinFilesListFilter, MixinFilesListScrolling],
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
    return {
      ...useResourcesViewDefaults<Resource, any, any[]>(),

      resourceTargetLocation: createLocationSpaces('files-spaces-personal', {
        params: { storageId: store.getters.user.id }
      })
    }
  },
  computed: {
    ...mapGetters(['configuration']),
    ...mapGetters('Files', ['highlightedFile', 'totalFilesCount', 'totalFilesSize']),
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
      handler: function () {
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
      },
      immediate: true
    }
  },
  beforeDestroy() {
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
