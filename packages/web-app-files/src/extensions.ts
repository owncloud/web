import {
  ApplicationSetupOptions,
  Extension,
  useStore,
  useRouter,
  useSearch
} from '@ownclouders/web-pkg'
import { computed } from 'vue'
import { SDKSearch } from './search'

export const extensions = ({ applicationConfig }: ApplicationSetupOptions) => {
  const store = useStore()
  const router = useRouter()
  const { search: searchFunction } = useSearch()

  return computed(
    () =>
      [
        {
          id: 'com.github.owncloud.web.files.search',
          type: 'search',
          searchProvider: new SDKSearch(store, router, searchFunction)
        }
      ] satisfies Extension[]
  )
}
