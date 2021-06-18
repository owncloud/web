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
        <template v-slot:message>
          <span v-translate>There are no resources in this folder</span>
        </template>
        <template v-if="currentFolder.canCreate()" v-slot:callToAction>
          <span v-translate>Drag files and folders here or use the "+ New" button to upload</span>
        </template>
      </no-content-message>
      <oc-table-files
        v-else
        id="files-public-files-table"
        v-model="selected"
        class="files-table"
        :class="{ 'files-table-squashed': isSidebarOpen }"
        :are-previews-displayed="displayPreviews"
        :resources="activeFiles"
        :target-route="targetRoute"
        :highlighted="highlightedFile ? highlightedFile.id : null"
        :header-position="headerPosition"
        @showDetails="setHighlightedFile"
        @fileClick="$_fileActions_triggerDefaultAction"
        @rowMounted="rowMounted"
      >
        <template #footer>
          <oc-pagination
            v-if="pages > 1"
            :pages="pages"
            :current-page="currentPage"
            :max-displayed="3"
            :current-route="$_filesListPagination_targetRoute"
          />
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
import { mapGetters, mapActions, mapMutations, mapState } from 'vuex'

import MixinAccessibleBreadcrumb from '../mixins/accessibleBreadcrumb'
import MixinFileActions from '../mixins/fileActions'
import MixinFilesListPositioning from '../mixins/filesListPositioning'
import MixinFilesListPagination from '../mixins/filesListPagination'

import { buildResource } from '../helpers/resources'
import ListLoader from '../components/ListLoader.vue'
import NoContentMessage from '../components/NoContentMessage.vue'
import NotFoundMessage from '../components/FilesLists/NotFoundMessage.vue'
import ListInfo from '../components/FilesListFooterInfo.vue'
import { VisibilityObserver } from 'web-pkg/src/observer'
import { ImageDimension } from '../constants'
import debounce from 'lodash-es/debounce'

const visibilityObserver = new VisibilityObserver()
export default {
  components: {
    ListInfo,
    ListLoader,
    NoContentMessage,
    NotFoundMessage
  },

  mixins: [
    MixinAccessibleBreadcrumb,
    MixinFileActions,
    MixinFilesListPositioning,
    MixinFilesListPagination
  ],

  data: () => ({
    loading: true
  }),

  computed: {
    ...mapState('Files', ['currentPage']),
    ...mapGetters('Files', [
      'publicLinkPassword',
      'activeFiles',
      'selectedFiles',
      'davProperties',
      'currentFolder',
      'highlightedFile',
      'inProgress',
      'currentFolder',
      'totalFilesCount',
      'totalFilesSize',
      'pages'
    ]),
    ...mapGetters(['configuration']),

    isEmpty() {
      return this.activeFiles.length < 1
    },

    isSidebarOpen() {
      return this.highlightedFile !== null
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

    displayPreviews() {
      return !this.configuration.options.disablePreviews
    }
  },

  watch: {
    $route: {
      handler: function(to, from) {
        const sameRoute = to.name === from?.name
        this.loadResources(sameRoute)
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
  methods: {
    ...mapActions('Files', ['setHighlightedFile', 'loadPreview']),
    ...mapMutations('Files', [
      'SELECT_RESOURCES',
      'SET_CURRENT_FOLDER',
      'LOAD_FILES',
      'CLEAR_CURRENT_FILES_LIST'
    ]),

    rowMounted(resource, component) {
      if (!this.displayPreviews) {
        return
      }

      const debounced = debounce(({ unobserve }) => {
        unobserve()
        this.loadPreview({
          resource,
          isPublic: true,
          dimensions: ImageDimension.ThumbNail
        })
      }, 250)

      visibilityObserver.observe(component.$el, { onEnter: debounced, onExit: debounced.cancel })
    },

    async loadResources(sameRoute) {
      this.loading = true
      this.CLEAR_CURRENT_FILES_LIST()

      const properties = this.davProperties.concat([
        this.$client.publicFiles.PUBLIC_LINK_ITEM_TYPE,
        this.$client.publicFiles.PUBLIC_LINK_PERMISSION,
        this.$client.publicFiles.PUBLIC_LINK_EXPIRATION,
        this.$client.publicFiles.PUBLIC_LINK_SHARE_DATETIME,
        this.$client.publicFiles.PUBLIC_LINK_SHARE_OWNER
      ])

      try {
        let resources = await this.$client.publicFiles.list(
          this.$route.params.item,
          this.publicLinkPassword,
          properties
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
