<template>
  <div class="uk-width-1-1">
    <div
      v-if="$asyncComputed.searchResults.updating"
      class="uk-flex uk-flex-middle uk-flex-center uk-height-1-1 uk-width-1-1"
    >
      <oc-spinner size="large" :aria-hidden="true" aria-label="" />
    </div>
    <template v-else>
      <component :is="listSearch.component" :search-results="searchResults" />
    </template>
  </div>
</template>

<script>
import { providerStore } from '../service'

export default {
  data() {
    const { provider: providerId } = this.$route.query
    const { listSearch } = providerStore.availableProviders.find(
      provider => provider.id === providerId
    )
    // abort and return if no provider is found
    return {
      listSearch
    }
  },

  asyncComputed: {
    searchResults: {
      get() {
        return this.listSearch.search(this.$route.query.term)
      },
      watch: ['$route.query.term', '$route.query.provider']
    }
  }
}
</script>

<style lang="scss">
#search-view {
  padding: 25px 10px 10px 10px;
}
</style>
