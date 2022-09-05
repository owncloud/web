<template>
  <component
    :is="listSearch.component"
    :search-result="searchResult"
    :loading="$asyncComputed.searchResult.updating"
  />
</template>

<script>
import { providerStore } from '../service'

export default {
  data() {
    const { provider: providerId } = this.$route.query
    const { listSearch } = providerStore.availableProviders.find(
      (provider) => provider.id === providerId
    )
    // abort and return if no provider is found
    return {
      listSearch
    }
  },

  asyncComputed: {
    searchResult: {
      get() {
        return this.listSearch.search(this.$route.query.term)
      },
      watch: ['$route.query.term', '$route.query.provider']
    }
  }
}
</script>
