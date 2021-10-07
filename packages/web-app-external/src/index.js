import translations from '../l10n/translations'
import App from './App.vue'
import store from './store'

// just a dummy function to trick gettext tools
function $gettext(msg) {
  return msg
}

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
    },
    meta: {
      title: $gettext('External app')
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
