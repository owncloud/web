import { AppNavigationItem, ExtensionRegistry, SidebarNavExtension } from '@ownclouders/web-pkg'

export interface NavItem extends Omit<AppNavigationItem, 'name'> {
  name: string
  active: boolean
}

export const getExtensionNavItems = ({
  extensionRegistry,
  appId
}: {
  extensionRegistry: ExtensionRegistry
  appId: string
}) =>
  extensionRegistry
    .requestExtensions<SidebarNavExtension>('sidebarNav', [`app.${appId}`])
    .map(({ navItem }) => navItem)
    .filter((n) => n.enabled())
