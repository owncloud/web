import { defineWebApplication } from '@ownclouders/web-pkg'
import App from './App.vue'
import { extensions } from './extensions'

const appInfo = {
  name: 'web-app-skeleton',
  id: 'skeleton',
  icon: 'folder',
  isFileEditor: true,
  extensions: []
}

const injectExtensions = async (api): Promise<void> => {
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

export default defineWebApplication({
  setup: () => {
    return {
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
      extensions: extensions(),
      async mounted(api) {
        await injectExtensions(api)
      }
    }
  }
})
