<template>
  <div>
    <list-loader v-if="loading" />
    <template v-else>
      <no-content-message v-if="isEmpty" id="files-trashbin-empty" icon="delete">
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
      />
    </template>
  </div>
</template>

<script>
import { mapGetters, mapActions, mapMutations } from 'vuex'

import { buildDeletedResource, buildResource } from '../helpers/resources'

import ListLoader from '../components/ListLoader.vue'
import NoContentMessage from '../components/NoContentMessage.vue'

export default {
  components: { ListLoader, NoContentMessage },

  data: () => ({
    loading: true
  }),

  computed: {
    ...mapGetters('Files', [
      'davProperties',
      'highlightedFile',
      'activeFiles',
      'selectedFiles',
      'inProgress'
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
    },

    headerPosition() {
      return this.uploadProgressVisible ? 190 : 110
    }
  },

  created() {
    this.loadResources()
  },

  methods: {
    ...mapActions('Files', ['setHighlightedFile']),
    ...mapMutations('Files', ['LOAD_FILES', 'SELECT_RESOURCES']),

    async loadResources() {
      this.loading = true

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
    }
  }
}
</script>
