<template>
  <div>
    <list-loader v-if="loading" />
    <template v-else>
      <no-content-message
        v-if="isEmpty"
        id="files-shared-with-me-empty"
        class="files-empty"
        icon="group"
      >
        <template #message>
          <span v-translate>
            You are currently not collaborating on other people's resources
          </span>
        </template>
      </no-content-message>
      <oc-table-files
        v-else
        id="files-shared-with-me-table"
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
        <template #status="{ resource }">
          <div
            :key="resource.id + resource.status"
            class="uk-text-nowrap uk-flex uk-flex-middle uk-flex-right"
          >
            <oc-button
              v-if="[shareStatus.pending, shareStatus.declined].includes(resource.status)"
              size="small"
              class="file-row-share-status-action"
              @click.stop="$_acceptShare_trigger(resource)"
            >
              <oc-icon size="small" name="check" />
              <translate>Accept</translate>
            </oc-button>
            <oc-button
              v-if="[shareStatus.pending, shareStatus.accepted].includes(resource.status)"
              size="small"
              class="file-row-share-status-action oc-ml-s"
              @click.stop="$_declineShare_trigger(resource)"
            >
              <oc-icon size="small" name="not_interested" />
              <translate>Decline</translate>
            </oc-button>
            <span
              class="uk-text-small oc-ml file-row-share-status-text uk-text-baseline"
              v-text="getShareStatusText(resource.status)"
            />
          </div>
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
          />
        </template>
      </oc-table-files>
    </template>
  </div>
</template>

<script>
import { mapGetters, mapState, mapActions, mapMutations } from 'vuex'
import { shareStatus } from '../helpers/shareStatus'
import { aggregateResourceShares } from '../helpers/resources'
import FileActions from '../mixins/fileActions'
import MixinAcceptShare from '../mixins/actions/acceptShare'
import MixinDeclineShare from '../mixins/actions/declineShare'
import MixinFilesListFilter from '../mixins/filesListFilter'
import MixinFilesListPositioning from '../mixins/filesListPositioning'
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
  components: {
    ListLoader,
    NoContentMessage,
    ListInfo,
    Pagination,
    ContextActions
  },

  mixins: [
    FileActions,
    MixinAcceptShare,
    MixinDeclineShare,
    MixinFilesListPositioning,
    MixinFilesListPagination,
    MixinMountSideBar,
    MixinFilesListFilter
  ],

  data: () => ({
    loading: true,
    shareStatus
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
    ...mapActions(['showMessage']),
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

      visibilityObserver.observe(component.$el, {
        onEnter: debounced,
        onExit: debounced.cancel
      })
    },

    async loadResources() {
      this.loading = true
      this.CLEAR_CURRENT_FILES_LIST()

      let resources = await this.$client.requests.ocs({
        service: 'apps/files_sharing',
        action: '/api/v1/shares?format=json&shared_with_me=true&state=all&include_tags=false',
        method: 'GET'
      })

      resources = await resources.json()
      resources = resources.ocs.data

      if (resources.length) {
        resources = aggregateResourceShares(
          resources,
          true,
          !this.isOcis,
          this.configuration.server,
          this.getToken
        )
      }

      this.LOAD_FILES({ currentFolder: null, files: resources })

      this.loading = false
    },

    getShareStatusText(status) {
      switch (status) {
        case shareStatus.accepted:
          return this.$gettext('Accepted')
        case shareStatus.declined:
          return this.$gettext('Declined')
        case shareStatus.pending:
        default:
          return this.$gettext('Pending')
      }
    }
  }
}
</script>
