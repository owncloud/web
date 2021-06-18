<template>
  <div>
    <list-loader v-if="loading" />
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
        :class="{ 'files-table-squashed': isSidebarOpen }"
        :are-paths-displayed="true"
        :are-previews-displayed="displayPreviews"
        :resources="activeFiles"
        :target-route="targetRoute"
        :highlighted="highlightedFile ? highlightedFile.id : null"
        :header-position="headerPosition"
        @showDetails="setHighlightedFile"
        @fileClick="$_fileActions_triggerDefaultAction"
        @rowMounted="rowMounted"
      >
        <template v-slot:quickActions="props">
          <quick-actions class="oc-visible@s" :item="props.resource" :actions="app.quickActions" />
        </template>
        <template #footer>
          <oc-pagination
            v-if="pages > 1"
            :pages="pages"
            :current-page="currentPage"
            :max-displayed="3"
            :current-route="$_filesListPagination_targetRoute"
            class="files-pagination uk-flex uk-flex-center oc-my-s"
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
import { mapGetters, mapState, mapActions, mapMutations } from 'vuex'

import { buildResource } from '../helpers/resources'
import FileActions from '../mixins/fileActions'
import MixinFilesListPositioning from '../mixins/filesListPositioning'
import MixinFilesListPagination from '../mixins/filesListPagination'

import QuickActions from '../components/FilesLists/QuickActions.vue'
import ListLoader from '../components/ListLoader.vue'
import NoContentMessage from '../components/NoContentMessage.vue'
import ListInfo from '../components/FilesListFooterInfo.vue'
import { VisibilityObserver } from 'web-pkg/src/observer'
import { ImageDimension } from '../constants'
import debounce from 'lodash-es/debounce'

const visibilityObserver = new VisibilityObserver()

export default {
  components: { QuickActions, ListLoader, NoContentMessage, ListInfo },

  mixins: [FileActions, MixinFilesListPositioning, MixinFilesListPagination],

  data: () => ({
    loading: true
  }),

  computed: {
    ...mapState(['app']),
    ...mapState('Files', ['currentPage', 'files']),
    ...mapGetters('Files', [
      'davProperties',
      'highlightedFile',
      'activeFiles',
      'selectedFiles',
      'inProgress',
      'totalFilesCount',
      'totalFilesSize',
      'pages'
    ]),
    ...mapGetters(['user', 'configuration']),

    isSidebarOpen() {
      return this.highlightedFile !== null
    },

    targetRoute() {
      return { name: 'files-personal' }
    },

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

    uploadProgressVisible() {
      return this.inProgress.length > 0
    },

    displayPreviews() {
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
    ...mapActions('Files', ['setHighlightedFile', 'loadIndicators', 'loadPreview']),
    ...mapMutations('Files', ['SELECT_RESOURCES', 'LOAD_FILES', 'CLEAR_CURRENT_FILES_LIST']),
    ...mapMutations(['SET_QUOTA']),

    rowMounted(resource, component) {
      if (!this.displayPreviews) {
        return
      }

      const debounced = debounce(({ unobserve }) => {
        unobserve()
        this.loadPreview({
          resource,
          isPublic: false,
          dimensions: ImageDimension.ThumbNail
        })
      }, 250)

      visibilityObserver.observe(component.$el, { onEnter: debounced, onExit: debounced.cancel })
    },

    async loadResources() {
      this.loading = true
      this.CLEAR_CURRENT_FILES_LIST()

      let resources = await this.$client.files.getFavoriteFiles(this.davProperties)
      const rootFolder = await this.$client.files.fileInfo('/', this.davProperties)

      resources = resources.map(buildResource)
      this.LOAD_FILES({ currentFolder: buildResource(rootFolder), files: resources })
      this.loadIndicators({ client: this.$client, currentFolder: '/' })

      // Load quota
      const user = await this.$client.users.getUser(this.user.id)

      this.SET_QUOTA(user.quota)
      this.loading = false
    }
  }
}
</script>
