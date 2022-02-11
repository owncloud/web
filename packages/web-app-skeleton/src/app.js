import App from './App.vue'

const appInfo = {
  name: 'web-app-skeleton',
  id: 'skeleton',
  icon: 'folder',
  isFileEditor: true,
  extensions: []
}

const injectExtensions = async (api) => {
  // the promise is just there to showcase lazy loading of extensions
  await new Promise((resolve) => setTimeout(resolve, 2000))

  api.announceExtension({
    extension: 'txt',
    isFileEditor: true,
    newFileMenu: {
      menuTitle($gettext) {
        return $gettext('Extension from skeleton')
      }
    }
  })
}

export default {
  appInfo,
  navItems: [
    {
      name: 'skeleton',
      icon: appInfo.icon,
      route: {
        path: `/${appInfo.id}/`
      }
    }
  ],
  routes: [
    {
      name: 'skeleton',
      path: '/',
      component: App
    }
  ],
  async mounted(api) {
    await injectExtensions(api)
  }
}
