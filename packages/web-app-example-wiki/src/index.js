import { bus } from 'web-pkg/src/instance'
import { WikiSearch } from './search'
import App from './App.vue'
import Page from './views/Page.vue'

const appInfo = {
  name: 'example-app-wiki',
  id: 'wiki',
  icon: 'folder',
  isFileEditor: true,
  extensions: []
}

export default {
  appInfo,
  routes: [
    {
      name: 'wiki',
      path: '/',
      components: {
        app: App
      },
      children: [
        {
          name: 'page',
          path: 'page/:id',
          component: Page
        }
      ]
    }
  ],
  mounted({ router }) {
    bus.emit('app.search.register.provider', new WikiSearch(router))
  }
}
