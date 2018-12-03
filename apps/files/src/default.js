import FilesApp from './components/FilesApp.vue'
import FileInfoSideBar from './components/FileInfoSidebar.vue'

const store = require('./store.js')

// --- Navigation Item(s) ------------------------------------------------------

const appInfo = {
  name: 'Files',
  id: 'files',
  icon: 'folder',
  isFileEditor: false,
  extensions: [],
  fileSideBars: [
    {
      app: 'files',
      name: 'Files',
      component: FileInfoSideBar
    }
  ]
}
const navItems = [{
  name: appInfo.name,
  iconMaterial: appInfo.icon,
  route: {
    name: 'files-list',
    params: {
      item: 'home'
    }
  }
}]

const routes = [{
  path: `/${appInfo.id}`,
  redirect: `/${appInfo.id}/list/home`
},
{
  path: `/${appInfo.id}/list/:item`,
  component: FilesApp,
  name: 'files-list',
  meta: {
    'hideHeadbar': false
  }
}
]

export default define({
  appInfo,
  store,
  routes,
  navItems
})
