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
        :class="{ 'files-table-squashed': !sidebarClosed }"
        :are-thumbnails-displayed="displayThumbnails"
        :resources="activeFilesCurrentPage"
        :target-route="targetRoute"
        :header-position="headerPosition"
        :drag-drop="true"
        @fileDropped="fileDropped"
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
import { bus } from 'web-pkg/src/instance'

import QuickActions from '../components/FilesList/QuickActions.vue'
import ListLoader from '../components/FilesList/ListLoader.vue'
import NoContentMessage from '../components/FilesList/NoContentMessage.vue'
import NotFoundMessage from '../components/FilesList/NotFoundMessage.vue'
import ListInfo from '../components/FilesList/ListInfo.vue'
import Pagination from '../components/FilesList/Pagination.vue'
import ContextActions from '../components/FilesList/ContextActions.vue'
import { DavProperties } from 'web-pkg/src/constants'
import { basename, join } from 'path'
import PQueue from 'p-queue'

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

  beforeRouteEnter(to, from, next) {
    next(vm => {
      if (vm.isRedirectToHomeFolderRequired(to)) {
        vm.redirectToHomeFolder(to)
      }
    })
  },

  async beforeRouteUpdate(to, from, next) {
    if (this.isRedirectToHomeFolderRequired(to)) {
      await this.redirectToHomeFolder(to)
      return
    }
    next()
  },

  data: () => ({
    loading: true
  }),

  computed: {
    ...mapState(['app']),
    ...mapState('Files', ['files']),
    ...mapState('Files/pagination', ['currentPage']),
    ...mapState('Files/sidebar', { sidebarClosed: 'closed' }),
    ...mapGetters('Files', [
      'highlightedFile',
      'selectedFiles',
      'inProgress',
      'activeFilesCurrentPage',
      'currentFolder',
      'totalFilesCount',
      'totalFilesSize'
    ]),
    ...mapGetters(['user', 'homeFolder', 'configuration']),

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

    bus.on('app.files.list.load', path => {
      this.loadResources(this.$route.params.item === path, path)
    })
  },

  beforeDestroy() {
    visibilityObserver.disconnect()
  },

  methods: {
    ...mapActions('Files', ['loadIndicators', 'loadPreview']),
    ...mapActions(['showMessage']),
    ...mapMutations('Files', [
      'SET_CURRENT_FOLDER',
      'LOAD_FILES',
      'CLEAR_CURRENT_FILES_LIST',
      'REMOVE_FILE',
      'REMOVE_FILE_FROM_SEARCHED',
      'SET_FILE_SELECTION',
      'REMOVE_FILE_SELECTION'
    ]),
    ...mapMutations(['SET_QUOTA']),

    isRedirectToHomeFolderRequired(to) {
      return isNil(to.params.item)
    },

    async redirectToHomeFolder(to) {
      const route = {
        name: to.name,
        params: {
          ...to.params,
          item: to.path.endsWith('/') ? '/' : this.homeFolder
        },
        query: to.query
      }
      await this.$router.replace(
        route,
        () => {},
        e => {
          console.error(e)
        }
      )
    },

    async fileDropped(fileIdTarget) {
      const selected = [...this.selectedFiles]
      const targetInfo = this.activeFilesCurrentPage.find(e => e.id === fileIdTarget)
      const isTargetSelected = selected.some(e => e.id === fileIdTarget)
      if (isTargetSelected) return
      if (targetInfo.type !== 'folder') return
      const itemsInTarget = await this.fetchResources(targetInfo.path)

      // try to move all selected files
      const errors = []
      const movePromises = []
      const moveQueue = new PQueue({ concurrency: 4 })
      selected.forEach(resource => {
        movePromises.push(
          moveQueue.add(async () => {
            const exists = itemsInTarget.some(e => basename(e.name) === resource.name)
            if (exists) {
              const message = this.$gettext('Resource with name %{name} already exists')
              errors.push({
                resource: resource.name,
                message: this.$gettextInterpolate(message, { name: resource.name }, true)
              })
              return
            }

            try {
              await this.$client.files.move(resource.path, join(targetInfo.path, resource.name))
              this.REMOVE_FILE(resource)
              this.REMOVE_FILE_FROM_SEARCHED(resource)
              this.REMOVE_FILE_SELECTION(resource)
            } catch (error) {
              console.error(error)
              error.resourceName = resource.name
              errors.push(error)
            }
          })
        )
      })
      await Promise.all(movePromises)

      // show error / success messages
      let title
      if (errors.length === 0) {
        const count = selected.length
        title = this.$ngettext(
          'Successfully moved %{count} item',
          'Successfully moved %{count} items',
          count
        )
        this.showMessage({
          title: this.$gettextInterpolate(title, { count }),
          status: 'success'
        })
        return
      }

      if (errors.length === 1) {
        title = this.$gettext('An error occurred while moving %{resource}')
        this.showMessage({
          title: this.$gettextInterpolate(title, { resource: errors[0].resourceName }, true),
          desc: errors[0].message,
          status: 'danger'
        })
        return
      }

      title = this.$gettext('An error occurred while moving several resources')
      const desc = this.$ngettext(
        '%{count} resource could not be moved',
        '%{count} resources could not be moved',
        errors.length
      )
      this.showMessage({
        title,
        desc: this.$gettextInterpolate(desc, { count: errors.length }, false),
        status: 'danger'
      })
    },

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
    async fetchResources(path, properties) {
      try {
        return await this.$client.files.list(path, 1, properties)
      } catch (error) {
        console.error(error)
      }
    },
    async loadResources(sameRoute, path = null) {
      this.loading = true
      this.CLEAR_CURRENT_FILES_LIST()

      try {
        let resources = await this.fetchResources(
          path || this.$route.params.item,
          DavProperties.Default
        )
        resources = resources.map(buildResource)

        const currentFolder = resources.shift()

        this.LOAD_FILES({
          currentFolder,
          files: resources
        })
        this.loadIndicators({
          client: this.$client,
          currentFolder: currentFolder.path
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

      if (resourceName && this.activeFilesCurrentPage.length > 0) {
        this.$nextTick(() => {
          const resource = this.activeFilesCurrentPage.find(r => r.name === resourceName)

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
