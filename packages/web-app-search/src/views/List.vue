<template>
  <component
    :is="listSearch.component"
    :search-result="searchResult"
    :loading="loading"
    @search="search"
  />
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import { providerStore } from '../service'

export default defineComponent({
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
  methods: {
    async search(term: string) {
      this.loading = true
      try {
        this.searchResult = await this.listSearch.search(term || '')
      } catch (e) {
        this.searchResult = {
          values: [],
          totalResults: null
        }
        console.error(e)
      }

      this.loading = false
    }
  }
})
</script>
