<template>
  <div>
    <list-loader v-if="loadResourcesTask.isRunning" />
    <template v-else>
      <no-content-message v-if="isEmpty" id="files-favorites-empty" class="files-empty" icon="star">
        <template #message>
          <span v-translate>There are no resources marked as favorite</span>
        </template>
      </no-content-message>
      <resource-table
        v-else
        id="files-favorites-table"
        v-model="selected"
        class="files-table"
        :class="{ 'files-table-squashed': !sidebarClosed }"
        :are-paths-displayed="true"
        :are-thumbnails-displayed="displayThumbnails"
        :resources="paginatedResources"
        :target-route="resourceTargetLocation"
        :header-position="fileListHeaderY"
        :sort-by="sortBy"
        :sort-dir="sortDir"
        @fileClick="$_fileActions_triggerDefaultAction"
        @rowMounted="rowMounted"
        @sort="handleSort"
      >
        <template #quickActions="props">
          <quick-actions class="oc-visible@s" :item="props.resource" :actions="app.quickActions" />
        </template>
        <template #contextMenu="{ resource }">
          <context-actions v-if="isResourceInSelection(resource)" :items="selected" />
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
  </div>
</template>

<script>
import { mapGetters, mapState, mapActions, mapMutations } from 'vuex'
import { computed, unref } from '@vue/composition-api'
import ResourceTable, { determineSortFields } from '../components/FilesList/ResourceTable.vue'

import { buildResource } from '../helpers/resources'
import FileActions from '../mixins/fileActions'
import MixinFilesListFilter from '../mixins/filesListFilter'
import MixinMountSideBar from '../mixins/sidebar/mountSideBar'
import { VisibilityObserver } from 'web-pkg/src/observer'
import { ImageDimension, ImageType } from '../constants'
import {
  useFileListHeaderPosition,
  useStore,
  useRouteQuery,
  usePagination,
  useSort
} from '../composables'
import debounce from 'lodash-es/debounce'
import { useTask } from 'vue-concurrency'

import QuickActions from '../components/FilesList/QuickActions.vue'
import ListLoader from '../components/FilesList/ListLoader.vue'
import NoContentMessage from '../components/FilesList/NoContentMessage.vue'
import ListInfo from '../components/FilesList/ListInfo.vue'
import Pagination from '../components/FilesList/Pagination.vue'
import ContextActions from '../components/FilesList/ContextActions.vue'
import { DavProperties } from 'web-pkg/src/constants'
import { createLocationSpaces } from '../router'

const visibilityObserver = new VisibilityObserver()

export default {
  components: {
    ResourceTable,
    QuickActions,
    ListLoader,
    Pagination,
    NoContentMessage,
    ListInfo,
    ContextActions
  },

  mixins: [FileActions, MixinMountSideBar, MixinFilesListFilter],

  setup() {
    const store = useStore()
    const { y: fileListHeaderY } = useFileListHeaderPosition()

    const storeItems = computed(() => store.getters['Files/activeFiles'] || [])
    const fields = computed(() => {
      return determineSortFields(unref(storeItems)[0])
    })

    const { sortBy, sortDir, items, handleSort } = useSort({
      items: storeItems,
      fields
    })

    const paginationPageQuery = useRouteQuery('page', '1')
    const paginationPage = computed(() => parseInt(String(paginationPageQuery.value)))
    const { items: paginatedResources, total: paginationPages } = usePagination({
      page: paginationPage,
      items,
      sortDir,
      sortBy
    })

    const loadResourcesTask = useTask(function* (signal, ref) {
      ref.CLEAR_CURRENT_FILES_LIST()

      let resources = yield ref.$client.files.getFavoriteFiles(DavProperties.Default)
      resources = resources.map(buildResource)
      ref.LOAD_FILES({ currentFolder: null, files: resources })
      ref.loadIndicators({ client: this.$client, currentFolder: '/' })
    })

    return {
      fileListHeaderY,
      loadResourcesTask,
      paginatedResources,
      paginationPages,
      resourceTargetLocation: createLocationSpaces('files-spaces-personal-home'),
      paginationPage,
      handleSort,
      sortBy,
      sortDir
    }
  },

  computed: {
    ...mapState(['app']),
    ...mapState('Files', ['files']),
    ...mapGetters('Files', [
      'highlightedFile',
      'selectedFiles',
      'totalFilesCount',
      'totalFilesSize'
    ]),
    ...mapState('Files/sidebar', { sidebarClosed: 'closed' }),
    ...mapGetters(['user', 'configuration']),

    selected: {
      get() {
        return this.selectedFiles
      },
      set(resources) {
        this.SET_FILE_SELECTION(resources)
      }
    },

    isEmpty() {
      return this.paginatedResources.length < 1
    },

    displayThumbnails() {
      return !this.configuration.options.disablePreviews
    }
  },

  created() {
    this.loadResourcesTask.perform(this)
  },

  beforeDestroy() {
    visibilityObserver.disconnect()
  },

  methods: {
    ...mapActions('Files', ['loadIndicators', 'loadPreview']),
    ...mapMutations('Files', ['SET_FILE_SELECTION', 'LOAD_FILES', 'CLEAR_CURRENT_FILES_LIST']),

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
    },

    isResourceInSelection(resource) {
      return this.selected?.includes(resource)
    }
  }
}
</script>
