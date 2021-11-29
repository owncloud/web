<template>
  <div>
    <list-loader v-if="loadResourcesTask.isRunning" />
    <template v-else>
      <no-content-message
        v-if="isEmpty"
        id="files-trashbin-empty"
        class="files-empty"
        icon="delete"
      >
        <template #message>
          <span v-translate>You have no deleted files</span>
        </template>
      </no-content-message>
      <oc-table-files
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
      >
        <template #contextMenu="{ resource }">
          <context-actions v-if="isResourceInSelection(resource)" :items="selected" />
        </template>
        <template #footer>
          <oc-pagination
            v-if="paginationPages > 1"
            :pages="paginationPages"
            :current-page="paginationPage"
            :max-displayed="3"
            :current-route="$route"
            class="files-pagination uk-flex uk-flex-center oc-my-s"
          />
          <list-info
            v-if="paginatedResources.length > 0"
            class="uk-width-1-1 oc-my-s"
            :files="totalFilesCount.files"
            :folders="totalFilesCount.folders"
          />
        </template>
      </oc-table-files>
    </template>
  </div>
</template>

<script>
import { mapGetters, mapMutations, mapState } from 'vuex'
import { computed } from '@vue/composition-api'

import { buildDeletedResource, buildResource } from '../helpers/resources'
import MixinFilesListFilter from '../mixins/filesListFilter'
import MixinResources from '../mixins/resources'
import MixinMountSideBar from '../mixins/sidebar/mountSideBar'
import {
  useFileListHeaderPosition,
  useStore,
  useRouteQuery,
  usePagination,
  useDefaults
} from '../composables'
import { useTask } from 'vue-concurrency'

import ListLoader from '../components/FilesList/ListLoader.vue'
import NoContentMessage from '../components/FilesList/NoContentMessage.vue'
import ListInfo from '../components/FilesList/ListInfo.vue'
import ContextActions from '../components/FilesList/ContextActions.vue'
import { DavProperties } from 'web-pkg/src/constants'

export default {
  components: { ListLoader, NoContentMessage, ListInfo, ContextActions },

  mixins: [MixinResources, MixinMountSideBar, MixinFilesListFilter],

  setup() {
    const store = useStore()
    const { pagination: paginationDefaults } = useDefaults()
    const { refresh: refreshFileListHeaderPosition, y: fileListHeaderY } =
      useFileListHeaderPosition()
    const paginationPageQuery = useRouteQuery('page', '1')
    const paginationPage = computed(() => parseInt(String(paginationPageQuery.value)))
    const paginationPerPageQuery = useRouteQuery('items-per-page', paginationDefaults.perPage.value)
    const { items: paginatedResources, total: paginationPages } = usePagination({
      page: paginationPage,
      perPage: computed(() => parseInt(String(paginationPerPageQuery.value))),
      items: computed(() => store.getters['Files/activeFiles'])
    })

    const loadResourcesTask = useTask(function* (signal, ref) {
      ref.CLEAR_CURRENT_FILES_LIST()

      const resources = yield ref.$client.fileTrash.list('', '1', DavProperties.Trashbin)

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
      paginationPage
    }
  },

  computed: {
    ...mapState('Files', ['files']),
    ...mapGetters('Files', ['highlightedFile', 'selectedFiles', 'totalFilesCount']),
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
  },

  methods: {
    ...mapMutations('Files', ['LOAD_FILES', 'SET_FILE_SELECTION', 'CLEAR_CURRENT_FILES_LIST']),

    isResourceInSelection(resource) {
      return this.selected?.includes(resource)
    }
  }
}
</script>
