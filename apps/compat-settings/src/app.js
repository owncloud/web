import 'core-js/stable'
import 'regenerator-runtime/runtime'

import translationsJson from '../l10n/translations'

import SettingsApp from './SettingsApp.vue'

// just a dummy function to trick gettext tools
function $gettext (msg) {
  return msg
}

const appInfo = {
  name: 'Draw.io',
  id: 'compat-settings',
  // icon: 'grid_on', // TODO
  extensions: [],
  isFileEditor: false
}
const navItems = [
  {
    name: $gettext('Settings'),
    // iconMaterial: 'settings', // TODO
    route: {
      name: 'compat-settings'
    }
  }
]

const routes = [
  {
    path: '',
    components: {
      app: SettingsApp
    },
    name: 'compat-settings'
  }
]

const translations = translationsJson
export default define({
  appInfo,
  routes,
  navItems,
  translations
})
