import { SearchExtension, SearchProvider, useExtensionRegistry } from '@ownclouders/web-pkg'
import { computed, Ref } from 'vue'

export const useAvailableProviders = (): Ref<SearchProvider[]> => {
  const extensionRegistry = useExtensionRegistry()

  const availableProviders = computed(() => {
    return extensionRegistry
      .requestExtensions<SearchExtension>('search')
      .map(({ searchProvider }) => searchProvider)
  })

  return availableProviders
}
