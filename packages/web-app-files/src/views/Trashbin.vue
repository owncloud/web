<template>
  <div>
    <list-loader v-if="loading" />
    <template v-else>
      <no-content-message
        v-if="isEmpty"
        id="files-trashbin-empty"
        class="files-empty"
        icon="delete"
      >
        <template #message>
          <span v-translate>You have no deleted files</span>
        </template>
      </no-content-message>
      <oc-table-files
        v-else
        id="files-trashbin-table"
        v-model="selected"
        class="files-table"
        :class="{ 'files-table-squashed': isSidebarOpen }"
        :are-paths-displayed="true"
        :are-previews-displayed="false"
        :resources="activeFiles"
        :highlighted="highlightedFile ? highlightedFile.id : null"
        :are-resources-clickable="false"
        :header-position="headerPosition"
        @showDetails="setHighlightedFile"
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
          </div>
        </template>
      </oc-table-files>
    </template>
  </div>
</template>

<script>
import { mapGetters, mapActions, mapMutations } from 'vuex'

import { buildDeletedResource, buildResource, getResourceSize } from '../helpers/resources'

import ListLoader from '../components/ListLoader.vue'
import NoContentMessage from '../components/NoContentMessage.vue'

export default {
  components: { ListLoader, NoContentMessage },

  data: () => ({
    loading: true,
    headerPosition: 110
  }),

  computed: {
    ...mapGetters('Files', [
      'davProperties',
      'highlightedFile',
      'activeFiles',
      'selectedFiles',
      'inProgress',
      'activeFilesCount'
    ]),

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
    }
  },

  watch: {
    uploadProgressVisible() {
      this.adjustTableHeaderPosition()
    }
  },

  created() {
    this.loadResources()
    window.onresize = this.adjustTableHeaderPosition
  },

  methods: {
    ...mapActions('Files', ['setHighlightedFile']),
    ...mapMutations('Files', ['LOAD_FILES', 'SELECT_RESOURCES', 'CLEAR_CURRENT_FILES_LIST']),

    async loadResources() {
      this.loading = true
      this.CLEAR_CURRENT_FILES_LIST()

      const resources = await this.$client.fileTrash.list('', '1', [
        '{http://owncloud.org/ns}trashbin-original-filename',
        '{http://owncloud.org/ns}trashbin-original-location',
        '{http://owncloud.org/ns}trashbin-delete-datetime',
        '{DAV:}getcontentlength',
        '{DAV:}resourcetype'
      ])

      this.LOAD_FILES({
        currentFolder: buildResource(resources[0]),
        files: resources.slice(1).map(buildDeletedResource)
      })
      this.loading = false
    },

    getResourceSize(size) {
      return getResourceSize(size)
    },

    adjustTableHeaderPosition() {
      const appBarPosition = document.querySelector('#files-app-bar')

      this.headerPosition = appBarPosition.getBoundingClientRect().bottom
    }
  }
}
</script>
