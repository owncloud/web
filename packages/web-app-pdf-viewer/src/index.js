import translations from '../l10n/translations'
import App from './App.vue'

// just a dummy function to trick gettext tools
function $gettext(msg) {
  return msg
}

const routes = [
  {
    path: '/:filePath*',
    component: App,
    name: 'pdf-viewer',
    meta: {
      auth: false,
      title: $gettext('PDF Viewer'),
      patchCleanPath: true
    }
  }
]

const appInfo = {
  name: $gettext('PDF Viewer'),
  id: 'pdf-viewer',
  icon: 'eye',
  extensions: [
    {
      extension: 'pdf',
      routeName: 'pdf-viewer',
      canBeDefault: true
    }
  ]
}

export default {
  appInfo,
  routes,
  translations
}
