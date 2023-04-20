import translations from '../l10n/translations.json'
import Resolve from './views/Resolve.vue'

// just a dummy function to trick gettext tools
function $gettext(msg) {
  return msg
}

const appInfo = {
  name: $gettext('Webfinger'),
  id: 'webfinger',
  icon: 'fingerprint',
  isFileEditor: false
}

const routes = () => [
  {
    name: 'root',
    path: '/',
    redirect: () => {
      return { name: 'webfinger-resolve' }
    },
    meta: {
      root: true
    }
  },
  {
    path: '/resolve',
    name: 'webfinger-resolve',
    component: Resolve,
    meta: {
      authContext: 'user',
      title: $gettext('Resolve ownCloud')
    }
  }
]

export default {
  appInfo,
  routes,
  translations
}
