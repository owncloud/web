const pkg = require('../package.json');
const store = require('./store.js')

// --- Navigation Item(s) ------------------------------------------------------

const appInfo = {
  name: 'Files',
  id: 'files',
  icon: 'folder',
  isFileEditor: false,
  extensions: []
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


import FilesApp from './components/FilesApp.vue';

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
