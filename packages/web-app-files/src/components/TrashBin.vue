<template>
  <div>
    <app-loading-spinner v-if="loadResourcesTask.isRunning" />
    <template v-else>
      <no-content-message
        v-if="isEmpty"
        id="files-trashbin-empty"
        class="files-empty"
        icon="delete-bin-5"
      >
        <template #message>
          <span v-if="noContentMessage">{{ noContentMessage }}</span>
          <span v-else v-translate>You have no deleted files</span>
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
import ResourceTable from './FilesList/ResourceTable.vue'

import MixinFilesListFilter from '../mixins/filesListFilter'
import MixinResources from '../mixins/resources'
import MixinMountSideBar from '../mixins/sidebar/mountSideBar'

import AppLoadingSpinner from 'web-pkg/src/components/AppLoadingSpinner.vue'
import NoContentMessage from 'web-pkg/src/components/NoContentMessage.vue'
import ListInfo from './FilesList/ListInfo.vue'
import Pagination from './FilesList/Pagination.vue'
import ContextActions from './FilesList/ContextActions.vue'
import { useResourcesViewDefaults } from '../composables'
import { bus } from 'web-pkg/src/instance'

export default {
  name: 'TrashBin',

  components: {
    ResourceTable,
    AppLoadingSpinner,
    NoContentMessage,
    ListInfo,
    Pagination,
    ContextActions
  },

  mixins: [MixinResources, MixinMountSideBar, MixinFilesListFilter],
  props: {
    noContentMessage: {
      type: String,
      required: false,
      default: ''
    }
  },

  setup() {
    return {
      ...useResourcesViewDefaults()
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

    const loadResourcesEventToken = bus.subscribe('app.files.list.load', (path) => {
      this.loadResourcesTask.perform(this, this.$route.params.item === path, path)
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
