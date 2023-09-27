import SearchBar from './portals/SearchBar.vue'
import App from './App.vue'
import List from './views/List.vue'
import { providerStore } from './service'
import { eventBus } from '@ownclouders/web-pkg'
import { SearchProvider } from './types'
import { Component } from 'vue'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import translations from '../l10n/translations.json'

// just a dummy function to trick gettext tools
const $gettext = (msg) => {
  return msg
}

eventBus.subscribe('app.search.register.provider', (provider: SearchProvider) => {
  providerStore.addProvider(provider)
})

export default {
  appInfo: {
    name: $gettext('Search'),
    id: 'search',
    icon: 'folder'
  },
  routes: [
    {
      name: 'search',
      path: '/',
      component: App,
      children: [
        {
          name: 'provider-list',
          path: 'list/:page?',
          component: List,
          meta: {
            authContext: 'user',
            contextQueryItems: ['term', 'provider']
          }
        }
      ]
    }
  ],
  translations,
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
