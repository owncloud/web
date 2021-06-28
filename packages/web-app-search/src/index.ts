import SearchBar from './portals/SearchBar.vue'
import App from './App.vue'
import store from './store'
import List from './views/List.vue'
import { providerStore } from './service'
import { bus } from 'web-pkg/src/instance'
import { SearchProvider } from './types'
import { Component } from 'vue'

// just a dummy function to trick gettext tools
const $gettext = msg => {
  return msg
}

bus.on('app.search.register.provider', (provider: SearchProvider) => {
  providerStore.addProvider(provider)
})

export default {
  appInfo: {
    name: $gettext('Search'),
    id: 'search',
    icon: 'folder'
  },
  store,
  routes: [
    {
      name: 'search',
      path: '/',
      components: {
        app: App
      },
      children: [
        {
          name: 'provider-list',
          path: 'list/:page?',
          component: List
        }
      ]
    }
  ],
  mounted({
    portal
  }: {
    portal: {
      open: (toApp: string, toPortal: string, order: number, components: Component[]) => void
    }
  }): void {
    portal.open('runtime', 'header', 1, [SearchBar])
  }
}
