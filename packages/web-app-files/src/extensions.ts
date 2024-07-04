import {
  Extension,
  useCapabilityStore,
  useConfigStore,
  useFileActionsCopyQuickLink,
  useFileActionsShowShares,
  useRouter,
  useSearch
} from '@ownclouders/web-pkg'
import { computed, unref } from 'vue'
import { SDKSearch } from './search'
import { useSideBarPanels } from './composables/extensions/useFileSideBars'
import { useFolderViews } from './composables/extensions/useFolderViews'
import { quickActionsExtensionPoint } from './extensionPoints'

export const extensions = () => {
  const capabilityStore = useCapabilityStore()
  const configStore = useConfigStore()
  const router = useRouter()
  const { search: searchFunction } = useSearch()

  const { actions: showSharesActions } = useFileActionsShowShares()
  const { actions: quickLinkActions } = useFileActionsCopyQuickLink()

  const folderViewExtensions = useFolderViews()
  const sideBarPanelExtensions = useSideBarPanels()

  return computed<Extension[]>(() => [
    ...folderViewExtensions,
    ...sideBarPanelExtensions,
    {
      id: 'com.github.owncloud.web.files.search',
      extensionPointIds: ['app.search.provider'],
      type: 'search',
      searchProvider: new SDKSearch(capabilityStore, router, searchFunction, configStore)
    },
    {
      id: 'com.github.owncloud.web.files.quick-action.collaborator',
      extensionPointIds: [quickActionsExtensionPoint.id],
      type: 'action',
      action: unref(showSharesActions)[0]
    },
    {
      id: 'com.github.owncloud.web.files.quick-action.quicklink',
      extensionPointIds: [quickActionsExtensionPoint.id],
      type: 'action',
      action: unref(quickLinkActions)[0]
    }
  ])
}
