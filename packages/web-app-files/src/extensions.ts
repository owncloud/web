import {
  ApplicationSetupOptions,
  Extension,
  useStore,
  useRouter,
  useSearch,
  useFileActionsShowShares,
  useFileActionsCreateQuickLink
} from '@ownclouders/web-pkg'
import { computed, unref } from 'vue'
import { SDKSearch } from './search'

export const extensions = ({ applicationConfig }: ApplicationSetupOptions) => {
  const store = useStore()
  const router = useRouter()
  const { search: searchFunction } = useSearch()

  const { actions: showSharesActions } = useFileActionsShowShares()
  const { actions: quickLinkActions } = useFileActionsCreateQuickLink()

  return computed(
    () =>
      [
        {
          id: 'com.github.owncloud.web.files.search',
          type: 'search',
          searchProvider: new SDKSearch(store, router, searchFunction)
        },
        {
          id: 'com.github.owncloud.web.files.quick-action.collaborator',
          scopes: ['files', 'files.quick-action'],
          type: 'action',
          action: unref(showSharesActions)[0]
        },
        {
          id: 'com.github.owncloud.web.files.quick-action.quicklink',
          scopes: ['files', 'files.quick-action'],
          type: 'action',
          action: unref(quickLinkActions)[0]
        }
      ] satisfies Extension[]
  )
}
