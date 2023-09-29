import App from './App.vue'
import { GitHubSearch } from './search/github'
import { eventBus } from '@ownclouders/web-pkg'

const appInfo = {
  name: 'web-app-skeleton',
  id: 'skeleton',
  icon: 'folder',
  isFileEditor: true,
  extensions: []
}

const injectSearch = (): void => {
  eventBus.publish('app.search.register.provider', new GitHubSearch())
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
    await injectSearch()
    await injectExtensions(api)
  }
}
