<template>
  <div>
    <list-loader v-if="loading" />
    <template v-else>
      <not-found-message v-if="folderNotFound" class="files-not-found uk-height-1-1" />
      <no-content-message
        v-else-if="isEmpty"
        id="files-public-list-empty"
        class="files-empty"
        icon="folder"
      >
        <template #message>
          <span v-translate>There are no resources in this folder</span>
        </template>
        <template v-if="currentFolder.canCreate()" #callToAction>
          <span v-translate>Drag files and folders here or use the "+ New" button to upload</span>
        </template>
      </no-content-message>
      <oc-table-files
        v-else
        id="files-public-files-table"
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
          <context-actions :item="resource" />
        </template>
        <template #footer>
          <pagination />
          <list-info
            v-if="activeFilesCurrentPage.length > 0"
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
import { mapGetters, mapActions, mapMutations, mapState } from 'vuex'

import MixinAccessibleBreadcrumb from '../mixins/accessibleBreadcrumb'
import MixinFileActions from '../mixins/fileActions'
import MixinFilesListPositioning from '../mixins/filesListPositioning'
import MixinFilesListPagination from '../mixins/filesListPagination'
import MixinMountSideBar from '../mixins/sidebar/mountSideBar'

import { VisibilityObserver } from 'web-pkg/src/observer'
import { ImageDimension, ImageType } from '../constants'
import debounce from 'lodash-es/debounce'
import { buildResource } from '../helpers/resources'
import { bus } from 'web-pkg/src/instance'

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
    ListInfo,
    ListLoader,
    NoContentMessage,
    NotFoundMessage,
    Pagination,
    ContextActions
  },

  mixins: [
    MixinAccessibleBreadcrumb,
    MixinFileActions,
    MixinFilesListPositioning,
    MixinFilesListPagination,
    MixinMountSideBar
  ],

  data: () => ({
    loading: true
  }),

  computed: {
    ...mapGetters('Files', [
      'publicLinkPassword',
      'activeFilesCurrentPage',
      'selectedFiles',
      'currentFolder',
      'highlightedFile',
      'inProgress',
      'currentFolder',
      'totalFilesCount',
      'totalFilesSize'
    ]),
    ...mapGetters(['configuration']),
    ...mapState('Files/sidebar', { sidebarClosed: 'closed' }),

    isEmpty() {
      return this.activeFilesCurrentPage.length < 1
    },

    uploadProgressVisible() {
      return this.inProgress.length > 0
    },

    selected: {
      get() {
        return this.selectedFiles
      },
      set(resources) {
        this.SET_FILE_SELECTION(resources)
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
        const sameRoute = to.name === from?.name
        const sameItem = to.params?.item === from?.params?.item
        if (!sameRoute || !sameItem) {
          this.loadResources(sameRoute)
        }

        this.$_filesListPagination_updateCurrentPage()
      },
      immediate: true
    },

    uploadProgressVisible() {
      this.adjustTableHeaderPosition()
    }
  },
  beforeDestroy() {
    visibilityObserver.disconnect()
  },

  created() {
    bus.on('app.files.list.load', path => {
      this.loadResources(this.$route.params.item === path, path)
    })
  },

  methods: {
    ...mapActions('Files', ['loadPreview']),
    ...mapMutations('Files', [
      'SET_FILE_SELECTION',
      'SET_CURRENT_FOLDER',
      'LOAD_FILES',
      'CLEAR_CURRENT_FILES_LIST'
    ]),

    rowMounted(resource, component) {
      if (!this.displayThumbnails) {
        return
      }

      const debounced = debounce(({ unobserve }) => {
        unobserve()
        this.loadPreview({
          resource,
          isPublic: true,
          dimensions: ImageDimension.Thumbnail,
          type: ImageType.Thumbnail
        })
      }, 250)

      visibilityObserver.observe(component.$el, { onEnter: debounced, onExit: debounced.cancel })
    },

    async loadResources(sameRoute, path = null) {
      this.loading = true
      this.CLEAR_CURRENT_FILES_LIST()

      try {
        let resources = await this.$client.publicFiles.list(
          path || this.$route.params.item,
          this.publicLinkPassword,
          DavProperties.PublicLink
        )

        // Redirect to files drop if the link has role "uploader"
        if (resources[0].getProperty(this.$client.publicFiles.PUBLIC_LINK_PERMISSION) === '4') {
          this.$router.push({
            name: 'files-public-link',
            params: {
              token: this.$route.params.item
            }
          })

          return
        }

        resources = resources.map(buildResource)
        this.LOAD_FILES({ currentFolder: resources[0], files: resources.slice(1) })

        this.adjustTableHeaderPosition()
        window.onresize = this.adjustTableHeaderPosition
      } catch (error) {
        this.SET_CURRENT_FOLDER(null)
        console.error(error)

        if (error.statusCode === 401) {
          this.redirectToResolvePage()
        }
      }

      this.loading = false
      this.accessibleBreadcrumb_focusAndAnnounceBreadcrumb(sameRoute)
    },

    redirectToResolvePage() {
      this.$router.push({
        name: 'files-public-link',
        params: { token: this.$route.params.item }
      })
    }
  }
}
</script>
