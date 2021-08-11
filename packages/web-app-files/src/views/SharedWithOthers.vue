<template>
  <div>
    <list-loader v-if="loading" />
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
      <oc-table-files
        v-else
        id="files-shared-with-others-table"
        v-model="selected"
        class="files-table"
        :class="{ 'files-table-squashed': isSidebarOpen }"
        :are-thumbnails-displayed="displayThumbnails"
        :resources="activeFiles"
        :target-route="targetRoute"
        :header-position="headerPosition"
        @showDetails="$_mountSideBar_showDefaultPanel"
        @fileClick="$_fileActions_triggerDefaultAction"
        @rowMounted="rowMounted"
      >
        <template #contextMenu="{ resource }">
          <context-actions :item="resource" />
        </template>
        <template #footer>
          <pagination />
          <list-info
            v-if="activeFiles.length > 0"
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

  data: () => ({
    loading: true
  }),

  computed: {
    ...mapState(['app']),
    ...mapState('Files', ['files']),
    ...mapGetters('Files', [
      'highlightedFile',
      'activeFiles',
      'selectedFiles',
      'inProgress',
      'totalFilesCount'
    ]),
    ...mapGetters(['isOcis', 'configuration', 'getToken', 'user']),

    selected: {
      get() {
        return this.selectedFiles
      },
      set(resources) {
        this.SELECT_RESOURCES(resources)
      }
    },

    isEmpty() {
      return this.activeFiles.length < 1
    },

    isSidebarOpen() {
      return this.highlightedFile !== null
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
    this.loadResources()
    window.onresize = this.adjustTableHeaderPosition
  },

  mounted() {
    this.adjustTableHeaderPosition()
  },

  beforeDestroy() {
    visibilityObserver.disconnect()
  },

  methods: {
    ...mapActions('Files', ['loadIndicators', 'loadPreview', 'loadAvatars']),
    ...mapMutations('Files', [
      'LOAD_FILES',
      'SELECT_RESOURCES',
      'CLEAR_CURRENT_FILES_LIST',
      'UPDATE_RESOURCE'
    ]),

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

    async loadResources() {
      this.loading = true
      this.CLEAR_CURRENT_FILES_LIST()

      let resources = await this.$client.requests.ocs({
        service: 'apps/files_sharing',
        action: '/api/v1/shares?format=json&reshares=true&include_tags=false',
        method: 'GET'
      })

      resources = await resources.json()
      resources = resources.ocs.data

      if (resources.length) {
        resources = aggregateResourceShares(
          resources,
          false,
          !this.isOcis,
          this.configuration.server,
          this.getToken
        )
      }

      this.LOAD_FILES({ currentFolder: null, files: resources })

      this.loading = false
    },

    shareStatus(status) {
      if (status === 0) {
        return this.$gettext('Accepted')
      }
      if (status === 1) {
        return this.$gettext('Pending')
      }
      if (status === 2) {
        return this.$gettext('Declined')
      }
    }
  }
}
</script>
