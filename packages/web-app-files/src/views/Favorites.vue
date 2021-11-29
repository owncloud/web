<template>
  <div>
    <list-loader v-if="loadResourcesTask.isRunning" />
    <template v-else>
      <no-content-message v-if="isEmpty" id="files-favorites-empty" class="files-empty" icon="star">
        <template #message>
          <span v-translate>There are no resources marked as favorite</span>
        </template>
      </no-content-message>
      <oc-table-files
        v-else
        id="files-favorites-table"
        v-model="selected"
        class="files-table"
        :class="{ 'files-table-squashed': !sidebarClosed }"
        :are-paths-displayed="true"
        :are-thumbnails-displayed="displayThumbnails"
        :resources="paginatedResources"
        :target-route="targetRoute"
        :header-position="fileListHeaderY"
        @fileClick="$_fileActions_triggerDefaultAction"
        @rowMounted="rowMounted"
      >
        <template #quickActions="props">
          <quick-actions class="oc-visible@s" :item="props.resource" :actions="app.quickActions" />
        </template>
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
            :size="totalFilesSize"
          />
        </template>
      </oc-table-files>
    </template>
  </div>
</template>

<script>
import { mapGetters, mapState, mapActions, mapMutations } from 'vuex'
import { computed } from '@vue/composition-api'

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
  useDefaults
} from '../composables'
import debounce from 'lodash-es/debounce'
import { useTask } from 'vue-concurrency'

import QuickActions from '../components/FilesList/QuickActions.vue'
import ListLoader from '../components/FilesList/ListLoader.vue'
import NoContentMessage from '../components/FilesList/NoContentMessage.vue'
import ListInfo from '../components/FilesList/ListInfo.vue'
import ContextActions from '../components/FilesList/ContextActions.vue'
import { DavProperties } from 'web-pkg/src/constants'

const visibilityObserver = new VisibilityObserver()

export default {
  components: {
    QuickActions,
    ListLoader,
    NoContentMessage,
    ListInfo,
    ContextActions
  },

  mixins: [FileActions, MixinMountSideBar, MixinFilesListFilter],

  setup() {
    const store = useStore()
    const { pagination: paginationDefaults } = useDefaults()
    const { y: fileListHeaderY } = useFileListHeaderPosition()
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
      paginationPage
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

    targetRoute() {
      return { name: 'files-personal' }
    },

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
