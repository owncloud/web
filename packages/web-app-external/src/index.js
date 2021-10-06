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
    path: '/:app/:file_id',
    components: {
      app: App
    }
  }
]

export default {
  appInfo,
  routes,
  store,
  translations,
  async ready({ store: runtimeStore }) {
    await runtimeStore.dispatch('External/fetchMimeTypes')
  }
}
