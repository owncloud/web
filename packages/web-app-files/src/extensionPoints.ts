import { ExtensionPoint } from '@ownclouders/web-pkg'
import { computed } from 'vue'

export const uploadMenuExtensionPointId = 'app.files.upload-menu'
export const quickActionsExtensionPointId = 'app.files.quick-actions'
export const batchActionsExtensionPointId = 'app.files.batch-actions'
export const contextActionsExtensionPointId = 'app.files.context-actions'
export const fileSideBarExtensionPointId = 'app.files.sidebar'
export const folderViewsFolder = 'app.files.folder-views.folder'
export const folderViewsFavorites = 'app.files.folder-views.favorites'
export const folderViewsProjectSpaces = 'app.files.folder-views.project-spaces'

export const extensionPoints = () => {
  return computed<ExtensionPoint[]>(() => {
    return [
      {
        id: uploadMenuExtensionPointId,
        extensionType: 'action',
        multiple: true
      },
      {
        id: quickActionsExtensionPointId,
        extensionType: 'action',
        multiple: true
      },
      {
        id: batchActionsExtensionPointId,
        extensionType: 'action',
        multiple: true
      },
      {
        id: contextActionsExtensionPointId,
        extensionType: 'action',
        multiple: true
      },
      {
        id: fileSideBarExtensionPointId,
        extensionType: 'sidebarPanel',
        multiple: true
      },
      {
        id: folderViewsFolder,
        extensionType: 'folderView'
      },
      {
        id: folderViewsFavorites,
        extensionType: 'folderView'
      },
      {
        id: folderViewsProjectSpaces,
        extensionType: 'folderView'
      }
    ]
  })
}
