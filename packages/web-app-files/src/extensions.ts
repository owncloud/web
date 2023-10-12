import {
  ApplicationSetupOptions,
  Extension,
  useStore,
  useRouter,
  useClientService,
  useConfigurationManager
} from '@ownclouders/web-pkg'
import { computed } from 'vue'
import { SDKSearch } from './search'

export const extensions = ({ applicationConfig }: ApplicationSetupOptions) => {
  const store = useStore()
  const router = useRouter()
  const clientService = useClientService()
  const configurationManager = useConfigurationManager()

  return computed(
    () =>
      [
        {
          id: 'com.github.owncloud.web.files.search',
          type: 'search',
          searchProvider: new SDKSearch(store, router, clientService, configurationManager)
        }
      ] satisfies Extension[]
  )
}
