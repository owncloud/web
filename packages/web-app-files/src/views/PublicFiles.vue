<template>
  <div>
    <oc-table-files :resources="activeFiles" />
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
export default {
  computed: {
    ...mapGetters('Files', ['publicLinkPassword', 'activeFiles', 'davProperties'])
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
