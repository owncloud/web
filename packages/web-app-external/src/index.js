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

async function fetchAvailableMimeTypes() {
  const vueStore = window.Vue.$store
  if (!vueStore.getters.capabilities.files.app_providers[0]?.enabled) {
    return
  }
  const serverUrl = vueStore.getters.configuration.server
  const appList = vueStore.getters.capabilities.files.app_providers[0].apps_url
  const url = serverUrl + appList.replace('/app', 'app')
  await vueStore.dispatch('External/fetchMimeTypes', url)
}

export default {
  appInfo,
  routes,
  store,
  translations,
  async mounted() {
    await fetchAvailableMimeTypes()
  }
}
