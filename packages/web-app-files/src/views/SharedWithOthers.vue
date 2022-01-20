<template>
  <div>
    <list-loader v-if="loadResourcesTask.isRunning" />
    <template v-else>
      <no-content-message
        v-if="isEmpty"
        id="files-shared-with-others-empty"
        class="files-empty"
        icon="group"
      >
        <template #message>
          <span v-translate>
            You are currently not collaborating on any of your resources with other people
          </span>
        </template>
      </no-content-message>
      <resource-table
        v-else
        id="files-shared-with-others-table"
        v-model="selected"
        class="files-table"
        :class="{ 'files-table-squashed': !sidebarClosed }"
        :are-thumbnails-displayed="displayThumbnails"
        :are-paths-displayed="true"
        :resources="paginatedResources"
        :target-route="resourceTargetLocation"
        :header-position="fileListHeaderY"
        :sort-by="sortBy"
        :sort-dir="sortDir"
        @fileClick="$_fileActions_triggerDefaultAction"
        @rowMounted="rowMounted"
        @sort="handleSort"
      >
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

import { aggregateResourceShares } from '../helpers/resources'
import FileActions from '../mixins/fileActions'
import MixinFilesListFilter from '../mixins/filesListFilter'
import MixinResources from '../mixins/resources'
import MixinMountSideBar from '../mixins/sidebar/mountSideBar'
import { VisibilityObserver } from 'web-pkg/src/observer'
import { ImageDimension, ImageType } from '../constants'
import { useFileListHeaderPosition, usePagination, useSort } from '../composables'
import { useRouteQuery, useStore } from 'web-pkg/src/composables'
import debounce from 'lodash-es/debounce'
import { useTask } from 'vue-concurrency'

import ListLoader from '../components/FilesList/ListLoader.vue'
import NoContentMessage from '../components/FilesList/NoContentMessage.vue'
import ListInfo from '../components/FilesList/ListInfo.vue'
import Pagination from '../components/FilesList/Pagination.vue'
import ContextActions from '../components/FilesList/ContextActions.vue'
import { createLocationSpaces } from '../router'

const visibilityObserver = new VisibilityObserver()

export default {
  components: { ResourceTable, ListLoader, NoContentMessage, ListInfo, Pagination, ContextActions },

  mixins: [FileActions, MixinResources, MixinMountSideBar, MixinFilesListFilter],

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

      let resources = yield ref.$client.requests.ocs({
        service: 'apps/files_sharing',
        action: '/api/v1/shares?format=json&reshares=true&include_tags=false',
        method: 'GET'
      })

      resources = yield resources.json()
      resources = resources.ocs.data

      if (resources.length) {
        resources = aggregateResourceShares(
          resources,
          false,
          !ref.isOcis,
          ref.configuration.server,
          ref.getToken
        )
      }

      ref.LOAD_FILES({ currentFolder: null, files: resources })
    })

    return {
      fileListHeaderY,
      loadResourcesTask,
      paginatedResources,
      paginationPages,
      paginationPage,
      handleSort,
      sortBy,
      sortDir,
      resourceTargetLocation: createLocationSpaces('files-spaces-personal-home')
    }
  },

  computed: {
    ...mapState(['app']),
    ...mapState('Files', ['files']),
    ...mapGetters('Files', ['highlightedFile', 'selectedFiles', 'totalFilesCount']),
    ...mapGetters(['isOcis', 'configuration', 'getToken', 'user']),
    ...mapState('Files/sidebar', { sidebarClosed: 'closed' }),

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
    ...mapActions('Files', ['loadIndicators', 'loadPreview', 'loadAvatars']),
    ...mapMutations('Files', ['LOAD_FILES', 'SET_FILE_SELECTION', 'CLEAR_CURRENT_FILES_LIST']),

    rowMounted(resource, component) {
      const debounced = debounce(({ unobserve }) => {
        unobserve()
        this.loadAvatars({ resource })

        if (!this.displayThumbnails) {
          return
        }

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
