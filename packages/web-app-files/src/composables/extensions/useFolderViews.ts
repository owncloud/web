import { FolderViewExtension } from '@ownclouders/web-pkg'
import { useGettext } from 'vue3-gettext'
import { ResourceTable } from '@ownclouders/web-pkg'
import ResourceTiles from '../../components/FilesList/ResourceTiles.vue'

export const useFolderViews = (): FolderViewExtension[] => {
  const { $gettext } = useGettext()

  return [
    {
      id: 'com.github.owncloud.web.files.folder-view.resource-table',
      type: 'folderView',
      scopes: ['resource', 'space', 'favorite'],
      folderView: {
        name: 'resource-table',
        label: $gettext('Switch to default table view'),
        icon: {
          name: 'menu-line',
          fillType: 'none'
        },
        component: ResourceTable
      }
    },
    {
      id: 'com.github.owncloud.web.files.folder-view.resource-table-condensed',
      type: 'folderView',
      scopes: ['resource'],
      folderView: {
        name: 'resource-table-condensed',
        label: $gettext('Switch to condensed table view'),
        icon: {
          name: 'menu-line-condensed',
          fillType: 'none'
        },
        component: ResourceTable
      }
    },
    {
      id: 'com.github.owncloud.web.files.folder-view.resource-tiles',
      type: 'folderView',
      scopes: ['resource', 'space', 'favorite'],
      folderView: {
        name: 'resource-tiles',
        label: $gettext('Switch to tiles view'),
        icon: {
          name: 'apps-2',
          fillType: 'line'
        },
        component: ResourceTiles
      }
    }
  ]
}
