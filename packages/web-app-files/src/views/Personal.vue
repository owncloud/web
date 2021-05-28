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
        <template v-slot:message>
          <span v-translate>There are no resources in this folder</span>
        </template>
        <template v-slot:callToAction>
          <span v-translate>Drag files and folders here or use the "+ New" button to upload</span>
        </template>
      </no-content-message>
      <oc-table-files
        v-else
        id="files-personal-table"
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
      >
        <template v-slot:quickActions="{ resource }">
          <quick-actions
            :class="resource.preview"
            class="oc-visible@s"
            :item="resource"
            :actions="app.quickActions"
          />
        </template>
        <template #footer>
          <div
            v-if="activeFilesCount.folders > 0 || activeFilesCount.files > 0"
            class="uk-text-nowrap oc-text-muted uk-text-center uk-width-1-1"
          >
            <span id="files-list-count-folders" v-text="activeFilesCount.folders" />
            <translate :translate-n="activeFilesCount.folders" translate-plural="folders"
              >folder</translate
            >
            <translate>and</translate>
            <span id="files-list-count-files" v-text="activeFilesCount.files" />
            <translate :translate-n="activeFilesCount.files" translate-plural="files"
              >file</translate
            >
            <template v-if="activeFiles.length > 0">
              &ndash; {{ getResourceSize(filesTotalSize) }}
            </template>
          </div>
        </template>
      </oc-table-files>
    </template>
  </div>
</template>

<script>
import { mapGetters, mapState, mapActions, mapMutations } from 'vuex'
import isNil from 'lodash/isNil'

import MixinAccessibleBreadcrumb from '../mixins/accessibleBreadcrumb'
import MixinFileActions from '../mixins/fileActions'
import MixinFilesListScrolling from '../mixins/filesListScrolling'
import MixinFilesListPositioning from '../mixins/filesListPositioning'
import MixinResources from '../mixins/resources'
import { buildResource } from '../helpers/resources'

import QuickActions from '../components/FilesLists/QuickActions.vue'
import ListLoader from '../components/ListLoader.vue'
import NoContentMessage from '../components/NoContentMessage.vue'
import NotFoundMessage from '../components/FilesLists/NotFoundMessage.vue'

export default {
  components: { QuickActions, ListLoader, NoContentMessage, NotFoundMessage },

  mixins: [
    MixinAccessibleBreadcrumb,
    MixinFileActions,
    MixinFilesListPositioning,
    MixinFilesListScrolling,
    MixinResources
  ],

  data: () => ({
    loading: true
  }),

  computed: {
    ...mapState(['app']),
    ...mapGetters('Files', [
      'davProperties',
      'highlightedFile',
      'activeFiles',
      'selectedFiles',
      'inProgress',
      'currentFolder',
      'activeFilesCount',
      'filesTotalSize'
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

    displayPreviews() {
      return !this.configuration.options.disablePreviews
    }
  },

  watch: {
    $route: {
      handler: function(to, from) {
        const sameRoute = to.name === from?.name
        this.checkHomeFallback()
        this.loadResources(sameRoute)
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

  methods: {
    ...mapActions('Files', ['setHighlightedFile', 'loadIndicators', 'loadPreviews']),
    ...mapMutations('Files', [
      'SELECT_RESOURCES',
      'SET_CURRENT_FOLDER',
      'LOAD_FILES',
      'CLEAR_CURRENT_FILES_LIST'
    ]),
    ...mapMutations(['SET_QUOTA']),

    checkHomeFallback() {
      if (isNil(this.$route.params.item)) {
        this.$router.push({
          name: 'files-personal',
          params: {
            item: this.homeFolder
          }
        })
      }
    },

    async loadResources(sameRoute) {
      this.loading = true
      this.CLEAR_CURRENT_FILES_LIST()

      try {
        let resources = await this.$client.files.list(
          this.$route.params.item,
          1,
          this.davProperties
        )

        resources = resources.map(buildResource)
        this.LOAD_FILES({ currentFolder: resources[0], files: resources.slice(1) })
        this.loadIndicators({ client: this.$client, currentFolder: this.$route.params.item })

        if (this.displayPreviews) {
          this.loadPreviews({
            resources,
            isPublic: false,
            mediaSource: this.mediaSource,
            encodePath: this.encodePath
          })
        }

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
            this.setHighlightedFile(resource)
            this.scrollToResource(resource)
          }
        })
      }
    }
  }
}
</script>
