import translations from '../l10n/translations.json'
import App from './App.vue'
import store from './store'

const appInfo = {
  name: 'External',
  id: 'external'
}

const routes = [
  {
    name: 'apps-remote',
    path: '/sciencemesh/:token/:remote_path?',
    component: App,
    meta: {
      authContext: 'anonymous',
      patchCleanPath: true
    }
  },
  {
    name: 'apps',
    path: '/:driveAliasAndItem(.*)?',
    component: App,
    meta: {
      authContext: 'hybrid',
      patchCleanPath: true
    }
  }
]

export default {
  appInfo,
  routes,
  store,
  translations,
  ready({ store }) {
    store.dispatch('External/fetchMimeTypes')
  }
}
