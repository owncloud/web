<template>
  <div>
    <list-loader v-if="loading" />
    <template v-else>
      <not-found-message v-if="folderNotFound" class="files-not-found uk-height-1-1" />
      <no-content-message
        v-else-if="isEmpty"
        id="files-public-files-empty"
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
        :resources="activeFiles"
        :target-route="targetRoute"
        :highlighted="highlightedFile ? highlightedFile.id : null"
        :header-position="headerPosition"
        @showDetails="setHighlightedFile"
        @fileClick="$_fileActions_triggerDefaultAction"
      >
        <template #footer>
          <div
            v-if="activeFilesCount.folders > 0 || activeFilesCount.files > 0"
            class="uk-text-nowrap uk-text-meta uk-text-center uk-width-1-1"
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
import { mapGetters, mapActions, mapMutations } from 'vuex'

import { buildResource } from '../helpers/resources'
import FileActions from '../mixins/fileActions'
import MixinFilesListPositioning from '../mixins/filesListPositioning'
import MixinResources from '../mixins/resources'

import ListLoader from '../components/ListLoader.vue'
import NoContentMessage from '../components/NoContentMessage.vue'
import NotFoundMessage from '../components/FilesLists/NotFoundMessage.vue'

export default {
  components: {
    ListLoader,
    NoContentMessage,
    NotFoundMessage
  },

  mixins: [FileActions, MixinFilesListPositioning, MixinResources],

  data: () => ({
    loading: true
  }),

  computed: {
    ...mapGetters('Files', [
      'publicLinkPassword',
      'activeFiles',
      'selectedFiles',
      'davProperties',
      'currentFolder',
      'highlightedFile',
      'inProgress',
      'currentFolder',
      'activeFilesCount',
      'filesTotalSize'
    ]),

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
    }
  },

  watch: {
    $route: {
      handler: 'loadResources',
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

    async loadResources() {
      this.loading = true
      this.CLEAR_CURRENT_FILES_LIST()

      try {
        let resources = await this.$client.publicFiles.list(
          this.$route.params.item,
          this.publicLinkPassword,
          this.davProperties
        )

        resources = resources.map(buildResource)
        this.LOAD_FILES({ currentFolder: resources[0], files: resources.slice(1) })
        this.loadPreviews({
          resources,
          isPublic: true,
          mediaSource: this.mediaSource
        })
      } catch (error) {
        this.SET_CURRENT_FOLDER(null)
        console.error(error)
      }

      this.adjustTableHeaderPosition()
      this.loading = false
    }
  }
}
</script>
