<template>
  <div>
    <oc-table-files
      :are-paths-displayed="true"
      :are-previews-displayed="false"
      :resources="activeFiles"
      :highlighted="highlightedFile ? highlightedFile.id : null"
      :is-resource-clickable="false"
      @showDetails="setHighlightedFile"
    />
  </div>
</template>

<script>
import { mapGetters, mapActions, mapMutations } from 'vuex'

import { buildDeletedResource, buildResource } from '../helpers/resources'

export default {
  computed: {
    ...mapGetters('Files', ['davProperties', 'highlightedFile', 'activeFiles'])
  },

  created() {
    this.loadResources()
  },

  methods: {
    ...mapActions('Files', ['setHighlightedFile']),
    ...mapMutations('Files', ['LOAD_FILES']),

    async loadResources() {
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
    }
  }
}
</script>
