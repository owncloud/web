export default {
  computed: {
    isListRoute() {
      return this.$route.name === 'all-files'
    },
    isFavoritesRoute() {
      return this.$route.name === 'favorites'
    },
    isTrashbinRoute() {
      return this.$route.name === 'trash-bin'
    },
    isSharedWithMeRoute() {
      return this.$route.name === 'shared-with-me'
    },
    isSharedWithOthersRoute() {
      return this.$route.name === 'shared-with-others'
    },
    isAnySharedWithRoute() {
      return this.isSharedWithMeRoute || this.isSharedWithOthersRoute
    },
    isPublicFilesRoute() {
      return this.$route.name === 'public-files'
    }
  }
}
