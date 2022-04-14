import translations from '../l10n/translations'
import App from './App.vue'
import store from './store'

const appInfo = {
  name: 'External',
  id: 'external'
}

const routes = [
  {
    name: 'apps',
    path: '/:filePath*',
    component: App,
    meta: {
      auth: false,
      patchCleanPath: true
    }
  }
]

export default {
  appInfo,
  routes,
  store,
  translations,
  userReady({ store }) {
    store.dispatch('External/fetchMimeTypes')
  }
}
