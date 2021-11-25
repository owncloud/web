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
        :resources="activeFilesCurrentPage"
        :are-resources-clickable="false"
        :header-position="fileListHeaderY"
      >
        <template #contextMenu="{ resource }">
          <context-actions v-if="isResourceInSelection(resource)" :items="selected" />
        </template>
        <template #footer>
          <pagination />
          <list-info
            v-if="activeFilesCurrentPage.length > 0"
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

import { buildDeletedResource, buildResource } from '../helpers/resources'
import MixinFilesListFilter from '../mixins/filesListFilter'
import MixinResources from '../mixins/resources'
import MixinFilesListPagination from '../mixins/filesListPagination'
import MixinMountSideBar from '../mixins/sidebar/mountSideBar'
import { useFileListHeaderPosition } from '../composables'
import { useTask } from 'vue-concurrency'

import ListLoader from '../components/FilesList/ListLoader.vue'
import NoContentMessage from '../components/FilesList/NoContentMessage.vue'
import ListInfo from '../components/FilesList/ListInfo.vue'
import Pagination from '../components/FilesList/Pagination.vue'
import ContextActions from '../components/FilesList/ContextActions.vue'
import { DavProperties } from 'web-pkg/src/constants'

export default {
  components: { ListLoader, NoContentMessage, ListInfo, Pagination, ContextActions },

  mixins: [MixinResources, MixinFilesListPagination, MixinMountSideBar, MixinFilesListFilter],

  setup() {
    const { refresh: refreshFileListHeaderPosition, y: fileListHeaderY } =
      useFileListHeaderPosition()

    const loadResourcesTask = useTask(function* (signal, ref) {
      ref.CLEAR_CURRENT_FILES_LIST()

      const resources = yield ref.$client.fileTrash.list('', '1', DavProperties.Trashbin)

      ref.LOAD_FILES({
        currentFolder: buildResource(resources[0]),
        files: resources.slice(1).map(buildDeletedResource)
      })
      refreshFileListHeaderPosition()
    })

    return { fileListHeaderY, loadResourcesTask }
  },

  computed: {
    ...mapState('Files', ['files']),
    ...mapGetters('Files', [
      'highlightedFile',
      'activeFilesCurrentPage',
      'selectedFiles',
      'totalFilesCount'
    ]),
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
      return this.activeFilesCurrentPage.length < 1
    }
  },

  watch: {
    $route: {
      handler: '$_filesListPagination_updateCurrentPage',
      immediate: true
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
