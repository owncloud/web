import translations from '../l10n/translations.json'
import App from './App.vue'

// just a dummy function to trick gettext tools
function $gettext(msg) {
  return msg
}

const routes = [
  {
    path: '/:driveAliasAndItem(.*)?',
    component: App,
    name: 'pdf-viewer',
    meta: {
      authContext: 'hybrid',
      title: $gettext('PDF Viewer'),
      patchCleanPath: true
    }
  }
]

const appInfo = {
  name: $gettext('PDF Viewer'),
  id: 'pdf-viewer',
  icon: 'resource-type-pdf',
  iconFillType: 'fill',
  extensions: [
    {
      extension: 'pdf',
      routeName: 'pdf-viewer'
    }
  ]
}

export default {
  appInfo,
  routes,
  translations
}
