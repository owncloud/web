import { SearchExtension, SearchProvider, useExtensionRegistry } from '@ownclouders/web-pkg'
import { computed, Ref } from 'vue'

export const useAvailableProviders = (): Ref<SearchProvider[]> => {
  const extensionRegistry = useExtensionRegistry()

  return computed(() => {
    return extensionRegistry
      .requestExtensions<SearchExtension>({ extensionType: 'search' })
      .map(({ searchProvider }) => searchProvider)
  })
}
