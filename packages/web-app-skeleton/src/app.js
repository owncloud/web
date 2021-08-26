import App from './App.vue'

const appInfo = {
  name: 'web-app-skeleton',
  id: 'skeleton',
  icon: 'folder',
  isFileEditor: true,
  extensions: []
}

const injectExtensions = async api => {
  // the promise is just there to deomo lazy loading of extensions
  await new Promise(resolve => setTimeout(resolve, 2000))
  console.log('#############################################################################')
  console.log('# FROM THE APP (SKELETON)')
  console.log('# a maybe long running task like wopi started')
  console.log('#############################################################################')
  await new Promise(resolve => setTimeout(resolve, 10000))
  console.log('#############################################################################')
  console.log('# FROM THE APP (SKELETON)')
  console.log('# the server answered and we have all information to register a extension')
  console.log('#############################################################################')

  api.registerExtension(appInfo.id, {
    extension: 'txt',
    newFileMenu: {
      menuTitle($gettext) {
        return $gettext('Extension from skeleton')
      }
    },
    routes: [
      'files-personal',
      'files-favorites',
      'files-shared-with-others',
      'files-shared-with-me',
      'files-public-list'
    ]
  })
  console.log('#############################################################################')
  console.log('# FROM THE APP (SKELETON)')
  console.log('# new extension is now registered, ...')
  console.log('#############################################################################')
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
  async mounted({ api }) {
    await injectExtensions(api)
  }
}
