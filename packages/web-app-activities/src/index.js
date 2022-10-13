import translations from '../l10n/translations'
import Activities from './views/Activities.vue'
// just a dummy function to trick gettext tools
function $gettext(msg) {
  return msg
}

const appInfo = {
  name: $gettext('Activities'),
  id: 'activities',
  icon: 'activities',
  isFileEditor: false
}

const routes = [
  {
    path: '/',
    name: 'activities-all',
    component: Activities,
    meta: {
      title: $gettext('Users')
    }
  }
]

const navItems = []

export default {
  appInfo,
  routes,
  translations,
  navItems
}
