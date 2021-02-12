export default {
  computed: {
    isListRoute() {
      return this.$route.name === 'files-all-files'
    },
    isFavoritesRoute() {
      return this.$route.name === 'files-favorites'
    },
    isTrashbinRoute() {
      return this.$route.name === 'files-trash-bin'
    },
    isSharedWithMeRoute() {
      return this.$route.name === 'files-shared-with-me'
    },
    isSharedWithOthersRoute() {
      return this.$route.name === 'files-shared-with-others'
    },
    isAnySharedWithRoute() {
      return this.isSharedWithMeRoute || this.isSharedWithOthersRoute
    },
    isPublicFilesRoute() {
      return this.$route.name === 'files-public-files'
    }
  }
}
