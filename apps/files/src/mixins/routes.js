export default {
  computed: {
    isListRoute() {
      return this.$route.name === 'files-list'
    },
    isFavoritesRoute() {
      return this.$route.name === 'files-favorites'
    },
    isTrashbinRoute() {
      return this.$route.name === 'files-trashbin'
    }
  }
}
