<template>
  <component :is="listSearch.component" :search-result="searchResult" :loading="loading" />
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import { providerStore } from '../service'
import { debounce } from 'lodash-es'

export default defineComponent({
  data() {
    // HACK: vue-tsc thinks this.$route is a `Function` for whatever reason
    // TODO: port to composition api
    const { provider: providerId } = (this.$route as any).query
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
    '$route.query': {
      handler: function (newVal, oldVal) {
        if (newVal?.term === oldVal?.term) {
          return
        }

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
})
</script>
