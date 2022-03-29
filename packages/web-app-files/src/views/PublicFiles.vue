<template>
  <div>
    <app-bar
      :has-bulk-actions="true"
      :breadcrumbs="breadcrumbs"
      :breadcrumbs-context-actions-items="[currentFolder]"
    >
      <template #actions>
        <create-and-upload />
      </template>
    </app-bar>
    <app-loading-spinner v-if="loadResourcesTask.isRunning" />
    <template v-else>
      <progress-bar v-show="$_uploadProgressVisible" id="files-upload-progress" class="oc-p-s" />
      <not-found-message v-if="folderNotFound" class="files-not-found oc-height-1-1" />
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
          <span v-translate data-testid="public-files-call-to-action">
            Drag files and folders here or use the "New" or "Upload" buttons to add files
          </span>
        </template>
      </no-content-message>
      <resource-table
        v-else
        id="files-public-files-table"
        v-model="selectedResources"
        class="files-table"
        :class="{ 'files-table-squashed': !sidebarClosed }"
        :are-thumbnails-displayed="displayThumbnails"
        :resources="paginatedResources"
        :target-route="targetRoute"
        :header-position="fileListHeaderY"
        :sort-by="sortBy"
        :sort-dir="sortDir"
        @fileClick="$_fileActions_triggerDefaultAction"
        @rowMounted="rowMounted"
        @sort="handleSort"
      >
        <template #contextMenu="{ resource }">
          <context-actions v-if="isResourceInSelection(resource)" :items="selectedResources" />
        </template>
        <template #footer>
          <pagination :pages="paginationPages" :current-page="paginationPage" />
          <list-info
            v-if="paginatedResources.length > 0"
            class="oc-width-1-1 oc-my-s"
            :files="totalFilesCount.files"
            :folders="totalFilesCount.folders"
            :size="totalFilesSize"
          />
        </template>
      </resource-table>
    </template>
  </div>
</template>

<script lang="ts">
import { mapGetters, mapActions, mapMutations, mapState } from 'vuex'
import ResourceTable from '../components/FilesList/ResourceTable.vue'
import { useResourcesViewDefaults } from '../composables'

import MixinAccessibleBreadcrumb from '../mixins/accessibleBreadcrumb'
import MixinFileActions from '../mixins/fileActions'
import MixinMountSideBar from '../mixins/sidebar/mountSideBar'

import { VisibilityObserver } from 'web-pkg/src/observer'
import { ImageDimension, ImageType } from '../constants'
import debounce from 'lodash-es/debounce'
import { bus } from 'web-pkg/src/instance'

import AppLoadingSpinner from 'web-pkg/src/components/AppLoadingSpinner.vue'
import NoContentMessage from 'web-pkg/src/components/NoContentMessage.vue'
import AppBar from '../components/AppBar/AppBar.vue'
import ProgressBar from '../components/Upload/ProgressBar.vue'
import CreateAndUpload from '../components/AppBar/CreateAndUpload.vue'
import NotFoundMessage from '../components/FilesList/NotFoundMessage.vue'
import ListInfo from '../components/FilesList/ListInfo.vue'
import Pagination from '../components/FilesList/Pagination.vue'
import ContextActions from '../components/FilesList/ContextActions.vue'
import { createLocationOperations } from '../router'
import { breadcrumbsFromPath, concatBreadcrumbs } from '../helpers/breadcrumbs'
import { defineComponent } from '@vue/composition-api'
import { Resource } from '../helpers/resource'

const visibilityObserver = new VisibilityObserver()

export default defineComponent({
  components: {
    AppBar,
    ProgressBar,
    CreateAndUpload,
    ResourceTable,
    ListInfo,
    Pagination,
    AppLoadingSpinner,
    NoContentMessage,
    NotFoundMessage,
    ContextActions
  },

  mixins: [MixinAccessibleBreadcrumb, MixinFileActions, MixinMountSideBar],

  setup() {
    return {
      ...useResourcesViewDefaults<Resource, any, any[]>()
    }
  },

  computed: {
    ...mapGetters('Files', [
      'publicLinkPassword',
      'currentFolder',
      'highlightedFile',
      'inProgress',
      'totalFilesCount',
      'totalFilesSize'
    ]),
    ...mapGetters(['configuration']),
    ...mapState('Files/sidebar', { sidebarClosed: 'closed' }),

    $_uploadProgressVisible() {
      return this.inProgress.length > 0
    },

    breadcrumbs() {
      const breadcrumbs = breadcrumbsFromPath(this.$route.path, this.$route.params.item)
      const rootRoute = breadcrumbs.shift()

      return concatBreadcrumbs(
        { text: this.$gettext('Public link'), to: rootRoute.to },
        ...breadcrumbs
      )
    },

    isEmpty() {
      return this.paginatedResources.length < 1
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
      handler: function (to, from) {
        const sameRoute = to.name === from?.name
        const sameItem = to.params?.item === from?.params?.item
        if (!sameRoute || !sameItem) {
          this.loadResourcesTask.perform(this, sameRoute)
        }
      },
      immediate: true
    }
  },
  beforeDestroy() {
    visibilityObserver.disconnect()
  },

  created() {
    const loadResourcesEventToken = bus.subscribe('app.files.list.load', (path) => {
      this.loadResourcesTask.perform(this, this.$route.params.item === path, path)
    })

    this.$on('beforeDestroy', () => bus.unsubscribe('app.files.list.load', loadResourcesEventToken))
  },

  methods: {
    ...mapActions('Files', ['loadPreview']),
    ...mapMutations('Files', ['SET_CURRENT_FOLDER', 'LOAD_FILES', 'CLEAR_CURRENT_FILES_LIST']),

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

    redirectToResolvePage() {
      this.$router.push(
        createLocationOperations('files-operations-resolver-public-link', {
          params: { token: this.$route.params.item }
        })
      )
    }
  }
})
</script>
