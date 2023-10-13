<template>
  <component
    :is="listSearch.component"
    :search-result="searchResult"
    :loading="loading"
    @search="search"
  />
</template>

<script lang="ts">
import { computed, defineComponent, ref, unref } from 'vue'
import { queryItemAsString, useRouteQuery } from '@ownclouders/web-pkg'
import { useAvailableProviders } from '../composables'

export default defineComponent({
  setup() {
    const availableProviders = useAvailableProviders()
    const providerId = useRouteQuery('provider')

    const listSearch = computed(() => {
      const { listSearch } = unref(availableProviders).find(
        (provider) => provider.id === queryItemAsString(unref(providerId))
      )
      return listSearch
    })

    const loading = ref(false)
    const searchResult = ref({
      values: [],
      totalResults: null
    })

    const search = async (term: string) => {
      loading.value = true
      try {
        searchResult.value = await unref(listSearch).search(term || '')
      } catch (e) {
        searchResult.value = {
          values: [],
          totalResults: null
        }
        console.error(e)
      }

      loading.value = false
    }

    return { listSearch, loading, searchResult, search }
  }
})
</script>
