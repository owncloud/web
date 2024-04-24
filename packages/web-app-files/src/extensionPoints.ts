import { ExtensionPoint } from '@ownclouders/web-pkg'
import { computed } from 'vue'

export const uploadMenuExtensionPoint: ExtensionPoint = {
  id: 'app.files.upload-menu',
  extensionType: 'action',
  multiple: true
}
export const quickActionsExtensionPoint: ExtensionPoint = {
  id: 'app.files.quick-actions',
  extensionType: 'action',
  multiple: true
}
export const batchActionsExtensionPoint: ExtensionPoint = {
  id: 'app.files.batch-actions',
  extensionType: 'action',
  multiple: true
}
export const contextActionsExtensionPoint: ExtensionPoint = {
  id: 'app.files.context-actions',
  extensionType: 'action',
  multiple: true
}
export const fileSideBarExtensionPoint: ExtensionPoint = {
  id: 'app.files.sidebar',
  extensionType: 'sidebarPanel',
  multiple: true
}
export const folderViewsFolderExtensionPoint: ExtensionPoint = {
  id: 'app.files.folder-views.folder',
  extensionType: 'folderView'
}
export const folderViewsFavoritesExtensionPoint: ExtensionPoint = {
  id: 'app.files.folder-views.favorites',
  extensionType: 'folderView'
}
export const folderViewsProjectSpacesExtensionPoint: ExtensionPoint = {
  id: 'app.files.folder-views.project-spaces',
  extensionType: 'folderView'
}

export const extensionPoints = () => {
  return computed<ExtensionPoint[]>(() => {
    return [
      uploadMenuExtensionPoint,
      quickActionsExtensionPoint,
      batchActionsExtensionPoint,
      contextActionsExtensionPoint,
      fileSideBarExtensionPoint,
      folderViewsFolderExtensionPoint,
      folderViewsFavoritesExtensionPoint,
      folderViewsProjectSpacesExtensionPoint
    ]
  })
}
