export default {
  computed: {
    $_isSearchActive(): boolean {
      return !!document.getElementById('files-global-search-options')
    }
  }
}
