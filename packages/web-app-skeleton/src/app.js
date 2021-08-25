import App from './App.vue'

const appInfo = {
  name: 'web-app-skeleton',
  id: 'skeleton',
  icon: 'folder',
  isFileEditor: false,
  extensions: []
}

export default {
  appInfo,
  navItems: [
    {
      name: 'skeleton',
      iconMaterial: appInfo.icon,
      route: {
        path: `/${appInfo.id}/`
      }
    }
  ],
  routes: [
    {
      name: 'skeleton',
      path: '/',
      components: {
        app: App
      }
    }
  ],
  mounted() {
    console.log('from skeleton app')
  }
}
