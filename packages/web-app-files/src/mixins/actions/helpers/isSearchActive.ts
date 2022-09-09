import { useSearchActive } from 'search/src/composables'

export default {
  computed: {
    $_isSearchActive(): boolean {
      return useSearchActive()
    }
  }
}
