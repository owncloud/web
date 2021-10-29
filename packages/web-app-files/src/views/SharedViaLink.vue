<template>
  <div>
    <list-loader v-if="loadResourcesTask.isRunning" />
    <template v-else>
      <no-content-message
        v-if="isEmpty"
        id="files-shared-via-link-empty"
        class="files-empty"
        icon="group"
      >
        <template #message>
          <span v-translate>There are no resources with a public link at the moment</span>
        </template>
      </no-content-message>
      <oc-table-files
        v-else
        id="files-shared-via-link-table"
        v-model="selected"
        class="files-table"
        :class="{ 'files-table-squashed': !sidebarClosed }"
        :are-thumbnails-displayed="displayThumbnails"
        :resources="activeFilesCurrentPage"
        :target-route="targetRoute"
        :header-position="headerPosition"
        @fileClick="$_fileActions_triggerDefaultAction"
        @rowMounted="rowMounted"
      >
        <template #contextMenu="{ resource }">
          <context-actions v-if="isHighlightedFile(resource)" :item="resource" />
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
import { mapGetters, mapState, mapActions, mapMutations } from 'vuex'

import { aggregateResourceShares } from '../helpers/resources'
import FileActions from '../mixins/fileActions'
import MixinFilesListFilter from '../mixins/filesListFilter'
import MixinFilesListPositioning from '../mixins/filesListPositioning'
import MixinResources from '../mixins/resources'
import MixinFilesListPagination from '../mixins/filesListPagination'
import MixinMountSideBar from '../mixins/sidebar/mountSideBar'
import { VisibilityObserver } from 'web-pkg/src/observer'
import { ImageDimension, ImageType } from '../constants'
import debounce from 'lodash-es/debounce'
import { useTask } from 'vue-concurrency'

import ListLoader from '../components/FilesList/ListLoader.vue'
import NoContentMessage from '../components/FilesList/NoContentMessage.vue'
import ListInfo from '../components/FilesList/ListInfo.vue'
import Pagination from '../components/FilesList/Pagination.vue'
import ContextActions from '../components/FilesList/ContextActions.vue'

const visibilityObserver = new VisibilityObserver()

export default {
  components: { ListLoader, NoContentMessage, ListInfo, Pagination, ContextActions },

  mixins: [
    FileActions,
    MixinFilesListPositioning,
    MixinResources,
    MixinFilesListPagination,
    MixinMountSideBar,
    MixinFilesListFilter
  ],

  setup() {
    const loadResourcesTask = useTask(function* (signal, ref) {
      ref.CLEAR_CURRENT_FILES_LIST()
      let resources = yield ref.$client.requests.ocs({
        service: 'apps/files_sharing',
        action: '/api/v1/shares?format=json&share_types=3&include_tags=false',
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

    return { loadResourcesTask }
  },

  computed: {
    ...mapState(['app']),
    ...mapState('Files', ['files']),
    ...mapGetters('Files', [
      'highlightedFile',
      'activeFilesCurrentPage',
      'selectedFiles',
      'inProgress',
      'totalFilesCount'
    ]),
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
      return this.activeFilesCurrentPage.length < 1
    },

    uploadProgressVisible() {
      return this.inProgress.length > 0
    },

    targetRoute() {
      return { name: 'files-personal' }
    },

    displayThumbnails() {
      return !this.configuration.options.disablePreviews
    }
  },

  watch: {
    uploadProgressVisible() {
      this.adjustTableHeaderPosition()
    },

    $route: {
      handler: '$_filesListPagination_updateCurrentPage',
      immediate: true
    }
  },

  created() {
    this.loadResourcesTask.perform(this)
    window.onresize = this.adjustTableHeaderPosition
  },

  mounted() {
    this.adjustTableHeaderPosition()
  },

  beforeDestroy() {
    visibilityObserver.disconnect()
  },

  methods: {
    ...mapActions('Files', ['loadIndicators', 'loadPreview']),
    ...mapMutations('Files', ['LOAD_FILES', 'SET_FILE_SELECTION', 'CLEAR_CURRENT_FILES_LIST']),

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

    isHighlightedFile(resource) {
      return resource && resource.id === this.highlightedFile?.id
    }
  }
}
</script>
