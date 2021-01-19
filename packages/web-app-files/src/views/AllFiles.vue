<template>
  <div>
    <oc-table-files :resources="resources" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { buildResource } from '../helpers/resources'

export default {
  name: 'AllFiles',

  data: () => ({
    currentFolder: null,
    resources: []
  }),

  computed: {
    ...mapGetters('Files', ['davProperties'])
  },

  created() {
    this.loadResources()
  },

  methods: {
    async loadResources() {
      let resources = await this.$client.files.list('/', 1, this.davProperties)
      resources = resources.map(resource => buildResource(resource))

      this.currentFolder = resources[0]
      this.resources = resources.slice(1)
    }
  }
}
</script>

<style lang="scss" scoped></style>
