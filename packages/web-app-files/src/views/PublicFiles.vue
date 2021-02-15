<template>
  <div>
    <list-loader v-if="state === 'loading'" />
    <oc-table-files v-else-if="state === 'loaded'" :resources="activeFiles" />
    <no-content-message v-else-if="state === 'empty'" icon="folder">
      <template v-slot:message>
        <span v-translate>There are no resources in this folder</span>
      </template>
      <template v-if="currentFolder.canCreate()" v-slot:callToAction>
        <span v-translate>Drag files and folders here or use the "+ New" button to upload</span>
      </template>
    </no-content-message>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

import ListLoader from '../components/ListLoader.vue'
import NoContentMessage from '../components/NoContentMessage.vue'

export default {
  components: {
    ListLoader,
    NoContentMessage
  },

  data: () => ({
    state: 'loading'
  }),

  computed: {
    ...mapGetters('Files', ['publicLinkPassword', 'activeFiles', 'davProperties', 'currentFolder'])
  },

  created() {
    this.loadResources()
  },

  methods: {
    ...mapActions('Files', ['setHighlightedFile', 'loadFiles', 'loadIndicators']),

    async loadResources() {
      this.state = 'loading'

      const resources = await this.$client.publicFiles.list(
        this.$route.params.item,
        this.publicLinkPassword,
        this.davProperties
      )

      console.log(resources)

      this.loadFiles({ currentFolder: resources[0], files: resources.slice(1) })

      if (resources.length === 1) {
        this.state = 'empty'

        return
      }

      this.state = 'loaded'
    }
  }
}
</script>
