<template>
  <component :is="listSearch.component" :search-result="searchResult" :loading="loading" />
</template>

<script>
import { providerStore } from '../service'
import debounce from 'lodash-es/debounce'

export default {
  data() {
    const { provider: providerId } = this.$route.query
    const { listSearch } = providerStore.availableProviders.find(
      (provider) => provider.id === providerId
    )
    // abort and return if no provider is found
    return {
      loading: false,
      debouncedSearch: undefined,
      searchResult: {
        values: [],
        totalResults: null
      },
      listSearch
    }
  },
  watch: {
    $route: {
      handler: function () {
        this.$nextTick(() => {
          this.debouncedSearch()
        })
      },
      immediate: true
    }
  },
  created() {
    this.debouncedSearch = debounce(this.search, 10)
  },
  methods: {
    async search() {
      this.loading = true
      this.searchResult = await this.listSearch.search(this.$route.query.term || '')
      this.loading = false
    }
  }
}
</script>
