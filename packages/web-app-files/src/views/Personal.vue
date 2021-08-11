<template>
  <div>
    <list-loader v-if="loading" />
    <template v-else>
      <not-found-message v-if="folderNotFound" class="files-not-found uk-height-1-1" />
      <no-content-message
        v-else-if="isEmpty"
        id="files-personal-empty"
        class="files-empty"
        icon="folder"
      >
        <template #message>
          <span v-translate>There are no resources in this folder</span>
        </template>
        <template #callToAction>
          <span v-translate>Drag files and folders here or use the "+ New" button to upload</span>
        </template>
      </no-content-message>
      <oc-table-files
        v-else
        id="files-personal-table"
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
        <template #quickActions="{ resource }">
          <quick-actions
            :class="resource.preview"
            class="oc-visible@s"
            :item="resource"
            :actions="app.quickActions"
          />
        </template>
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
            :size="totalFilesSize"
          />
        </template>
      </oc-table-files>
    </template>
  </div>
</template>

<script>
import { mapGetters, mapState, mapActions, mapMutations } from 'vuex'
import isNil from 'lodash-es/isNil'
import debounce from 'lodash-es/debounce'

import MixinAccessibleBreadcrumb from '../mixins/accessibleBreadcrumb'
import MixinFileActions from '../mixins/fileActions'
import MixinFilesListFilter from '../mixins/filesListFilter'
import MixinFilesListScrolling from '../mixins/filesListScrolling'
import MixinFilesListPositioning from '../mixins/filesListPositioning'
import MixinFilesListPagination from '../mixins/filesListPagination'
import MixinMountSideBar from '../mixins/sidebar/mountSideBar'
import { buildResource } from '../helpers/resources'
import { VisibilityObserver } from 'web-pkg/src/observer'
import { ImageDimension, ImageType } from '../constants'

import QuickActions from '../components/FilesList/QuickActions.vue'
import ListLoader from '../components/FilesList/ListLoader.vue'
import NoContentMessage from '../components/FilesList/NoContentMessage.vue'
import NotFoundMessage from '../components/FilesList/NotFoundMessage.vue'
import ListInfo from '../components/FilesList/ListInfo.vue'
import Pagination from '../components/FilesList/Pagination.vue'
import ContextActions from '../components/FilesList/ContextActions.vue'
import { DavProperties } from 'web-pkg/src/constants'

const visibilityObserver = new VisibilityObserver()

export default {
  components: {
    QuickActions,
    ListLoader,
    NoContentMessage,
    NotFoundMessage,
    ListInfo,
    Pagination,
    ContextActions
  },

  mixins: [
    MixinAccessibleBreadcrumb,
    MixinFileActions,
    MixinFilesListPositioning,
    MixinFilesListScrolling,
    MixinFilesListPagination,
    MixinMountSideBar,
    MixinFilesListFilter
  ],

  data: () => ({
    loading: true
  }),

  computed: {
    ...mapState(['app']),
    ...mapState('Files', ['currentPage', 'files', 'filesPageLimit']),
    ...mapGetters('Files', [
      'highlightedFile',
      'selectedFiles',
      'inProgress',
      'activeFiles',
      'currentFolder',
      'totalFilesCount',
      'totalFilesSize'
    ]),
    ...mapGetters(['user', 'homeFolder', 'configuration']),
    isSidebarOpen() {
      return this.highlightedFile !== null
    },

    isEmpty() {
      return this.activeFiles.length < 1
    },

    uploadProgressVisible() {
      return this.inProgress.length > 0
    },

    selected: {
      get() {
        return this.selectedFiles
      },
      set(resources) {
        this.SELECT_RESOURCES(resources)
      }
    },

    folderNotFound() {
      return this.currentFolder === null
    },

    targetRoute() {
      return { name: this.$route.name }
    },

    displayThumbnails() {
      return !this.configuration.options.disablePreviews
    }
  },

  watch: {
    $route: {
      handler: function(to, from) {
        if (isNil(this.$route.params.item)) {
          this.$router.push({
            name: 'files-personal',
            params: {
              item: this.homeFolder
            }
          })

          return
        }

        this.$_filesListPagination_updateCurrentPage()

        const sameRoute = to.name === from?.name
        const sameItem = to.params?.item === from?.params?.item
        if (!sameRoute || !sameItem) {
          this.loadResources(sameRoute)
        }
      },
      immediate: true
    },

    uploadProgressVisible() {
      this.adjustTableHeaderPosition()
    }
  },

  created() {
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
    ...mapMutations('Files', [
      'SELECT_RESOURCES',
      'SET_CURRENT_FOLDER',
      'LOAD_FILES',
      'CLEAR_CURRENT_FILES_LIST',
      'UPDATE_CURRENT_PAGE'
    ]),
    ...mapMutations(['SET_QUOTA']),

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

    async loadResources(sameRoute) {
      this.loading = true
      this.CLEAR_CURRENT_FILES_LIST()

      try {
        let resources = await this.$client.files.list(
          this.$route.params.item,
          1,
          DavProperties.Default
        )

        resources = resources.map(buildResource)
        this.LOAD_FILES({
          currentFolder: resources[0],
          files: resources.slice(1)
        })
        this.loadIndicators({
          client: this.$client,
          currentFolder: this.$route.params.item
        })

        // Load quota
        const user = await this.$client.users.getUser(this.user.id)

        this.SET_QUOTA(user.quota)
      } catch (error) {
        this.SET_CURRENT_FOLDER(null)
        console.error(error)
      }

      this.adjustTableHeaderPosition()
      this.loading = false
      this.accessibleBreadcrumb_focusAndAnnounceBreadcrumb(sameRoute)
      this.scrollToResourceFromRoute()
    },

    scrollToResourceFromRoute() {
      const resourceName = this.$route.query.scrollTo

      if (resourceName && this.activeFiles.length > 0) {
        this.$nextTick(() => {
          const resource = this.activeFiles.find(r => r.name === resourceName)

          if (resource) {
            this.selected = [resource]
            this.$_mountSideBar_showDefaultPanel(resource)
            this.scrollToResource(resource)
          }
        })
      }
    }
  }
}
</script>
