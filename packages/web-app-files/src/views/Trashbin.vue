<template>
  <div>
    <list-loader v-if="state === 'loading'" />
    <oc-table-files
      v-if="state === 'loaded'"
      id="files-trashbin-table"
      v-model="selected"
      :are-paths-displayed="true"
      :are-previews-displayed="false"
      :resources="activeFiles"
      :highlighted="highlightedFile ? highlightedFile.id : null"
      :are-resources-clickable="false"
      :header-position="132"
      @showDetails="setHighlightedFile"
    />
    <no-content-message v-else-if="state === 'empty'" icon="delete">
      <template #message>
        <span v-translate>You have no deleted files</span>
      </template>
    </no-content-message>
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
    state: 'loading'
  }),

  computed: {
    ...mapGetters('Files', ['davProperties', 'highlightedFile', 'activeFiles', 'selectedFiles']),

    selected: {
      get() {
        return this.selectedFiles
      },
      set(resources) {
        this.SELECT_RESOURCES(resources)
      }
    }
  },

  created() {
    this.loadResources()
  },

  methods: {
    ...mapActions('Files', ['setHighlightedFile']),
    ...mapMutations('Files', ['LOAD_FILES', 'SELECT_RESOURCES']),

    async loadResources() {
      this.state = 'loading'

      const resources = await this.$client.fileTrash.list('', '1', [
        '{http://owncloud.org/ns}trashbin-original-filename',
        '{http://owncloud.org/ns}trashbin-original-location',
        '{http://owncloud.org/ns}trashbin-delete-datetime',
        '{DAV:}getcontentlength',
        '{DAV:}resourcetype'
      ])

      if (resources.length === 1) {
        this.LOAD_FILES({
          currentFolder: buildResource(resources[0]),
          files: []
        })
        this.state = 'empty'

        return
      }

      this.LOAD_FILES({
        currentFolder: buildResource(resources[0]),
        files: resources.slice(1).map(buildDeletedResource)
      })
      this.state = 'loaded'
    }
  }
}
</script>
