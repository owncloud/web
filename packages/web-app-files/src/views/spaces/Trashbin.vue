<template>
  <div>
    <list-loader v-if="loadResourcesTask.isRunning" />
    <template v-else>
      <no-content-message
        v-if="isEmpty"
        id="files-trashbin-empty"
        class="files-empty"
        icon="delete-bin-5"
      >
        <template #message>
          <span v-translate>Space have no deleted files</span>
        </template>
      </no-content-message>
      <resource-table
        v-else
        id="files-trashbin-table"
        v-model="selected"
        class="files-table"
        :class="{ 'files-table-squashed': !sidebarClosed }"
        :are-paths-displayed="true"
        :are-thumbnails-displayed="false"
        :resources="paginatedResources"
        :are-resources-clickable="false"
        :header-position="fileListHeaderY"
        :sort-by="sortBy"
        :sort-dir="sortDir"
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
import { mapGetters, mapMutations, mapState } from 'vuex'
import { computed, unref } from '@vue/composition-api'
import ResourceTable, { determineSortFields } from '../../components/FilesList/ResourceTable.vue'

import {
  buildDeletedResource,
  buildResource,
  buildWebDavFilesTrashPath
} from '../../helpers/resources'
import MixinFilesListFilter from '../../mixins/filesListFilter'
import MixinResources from '../../mixins/resources'
import MixinMountSideBar from '../../mixins/sidebar/mountSideBar'
import { useFileListHeaderPosition, usePagination, useSort } from '../../composables'
import { useRouteQuery, useStore } from 'web-pkg/src/composables'
import { useTask } from 'vue-concurrency'

import ListLoader from '../../components/FilesList/ListLoader.vue'
import NoContentMessage from '../../components/FilesList/NoContentMessage.vue'
import ListInfo from '../../components/FilesList/ListInfo.vue'
import Pagination from '../../components/FilesList/Pagination.vue'
import ContextActions from '../../components/FilesList/ContextActions.vue'
import { DavProperties } from 'web-pkg/src/constants'
import { bus } from 'web-pkg/src/instance'

export default {
  components: { ResourceTable, ListLoader, NoContentMessage, ListInfo, Pagination, ContextActions },

  mixins: [MixinResources, MixinMountSideBar, MixinFilesListFilter],

  setup() {
    const store = useStore()
    const { refresh: refreshFileListHeaderPosition, y: fileListHeaderY } =
      useFileListHeaderPosition()

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
      sortBy,
      sortDir
    })

    const loadResourcesTask = useTask(function* (signal, ref) {
      ref.CLEAR_CURRENT_FILES_LIST()
      const resources = yield ref.$client.fileTrash.list(
        buildWebDavFilesTrashPath(ref.user.id),
        '1',
        DavProperties.Trashbin
      )

      ref.LOAD_FILES({
        currentFolder: buildResource(resources[0]),
        files: resources.slice(1).map(buildDeletedResource)
      })
      refreshFileListHeaderPosition()
    })

    return {
      fileListHeaderY,
      loadResourcesTask,
      paginatedResources,
      paginationPages,
      paginationPage,
      handleSort,
      sortBy,
      sortDir
    }
  },

  computed: {
    ...mapState('Files', ['files']),
    ...mapGetters('Files', ['highlightedFile', 'selectedFiles', 'totalFilesCount']),
    ...mapGetters(['user']),
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
    }
  },

  created() {
    this.loadResourcesTask.perform(this)

    const loadResourcesEventToken = bus.subscribe('app.files.list.load', (path) => {
      this.loadResourcesTask.perform(this)
    })

    this.$on('beforeDestroy', () => {
      bus.unsubscribe('app.files.list.load', loadResourcesEventToken)
    })
  },

  methods: {
    ...mapMutations('Files', ['LOAD_FILES', 'SET_FILE_SELECTION', 'CLEAR_CURRENT_FILES_LIST']),

    isResourceInSelection(resource) {
      return this.selected?.includes(resource)
    }
  }
}
</script>
