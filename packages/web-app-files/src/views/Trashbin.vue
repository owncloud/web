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
          <oc-pagination
            v-if="paginationLength > 1"
            :pages="paginationLength"
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
          />
        </template>
      </oc-table-files>
    </template>
  </div>
</template>

<script>
import { mapGetters, mapActions, mapMutations, mapState } from 'vuex'

import { buildDeletedResource, buildResource } from '../helpers/resources'
import MixinFilesListPositioning from '../mixins/filesListPositioning'
import MixinResources from '../mixins/resources'
import MixinFilesListPagination from '../mixins/filesListPagination'

import ListLoader from '../components/ListLoader.vue'
import NoContentMessage from '../components/NoContentMessage.vue'
import ListInfo from '../components/FilesListFooterInfo.vue'

export default {
  components: { ListLoader, NoContentMessage, ListInfo },

  mixins: [MixinFilesListPositioning, MixinResources, MixinFilesListPagination],

  data: () => ({
    loading: true
  }),

  computed: {
    ...mapState('Files', ['currentPage', 'files']),
    ...mapGetters('Files', [
      'davProperties',
      'highlightedFile',
      'activeFiles',
      'selectedFiles',
      'inProgress',
      'totalFilesCount',
      'paginationLength'
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
      this.adjustTableHeaderPosition()
      this.loading = false
    }
  }
}
</script>
