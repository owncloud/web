<template>
  <div class="oc-flex">
    <files-view-wrapper class="oc-flex-column">
    <backups-section id="backups-section" :empty-message="emptyMessage" />
  </files-view-wrapper>
  </div>
</template>

<script lang="ts">
import { mapGetters } from 'vuex'
import BackupsSection from '../components/BackupsSection.vue'
import { defineComponent } from 'vue'
import FilesViewWrapper from 'web-app-files/src/components/FilesViewWrapper.vue'
import AppBar from 'web-app-files/src/components/AppBar/AppBar.vue'

export default defineComponent({
  components: {
    FilesViewWrapper,
    AppBar,
    BackupsSection
  },
  // setup() {
  //   const {
  //     areResourcesLoading,
  //     fields,
  //     fileListHeaderY,
  //     loadResourcesTask,
  //     selectedResources,
  //     selectedResourcesIds,
  //     storeItems
  //   } = useResourcesViewDefaults<Resource, any, any[]>()
  //   // backup items
  //   const backups = storeItems
  //   const {
  //     sortBy,
  //     sortDir,
  //     items: backupItems,
  //     handleSort
  //   } = useSort({
  //     items: backups,
  //     fields,
  //     sortByQueryName: 'backups-sort-by',
  //     sortDirQueryName: 'backups-sort-dir'
  //   })
  //   return {
  //     // defaults
  //     loadResourcesTask,
  //     areResourcesLoading,
  //     selectedResources,
  //     selectedResourcesIds,
  //     fileListHeaderY,
  //     handleSort,
  //     sortBy,
  //     sortDir,
  //     backupItems
  //   }
  // },
  computed: {
    ...mapGetters(['configuration']),
    emptyMessage() {
      return this.$route.name === 'backups-restore-jobs'
        ? this.$gettext("You don't have any restore jobs.")
        : this.$gettext("You don't have any backups.")
    }
  }
})
</script>

<style scoped>
h2 {
  font-size: 1.3em;
  margin-top: 0;
}
</style>
