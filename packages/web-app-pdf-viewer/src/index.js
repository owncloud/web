import translations from '../l10n/translations'
import App from './App.vue'

const routes = [
  {
    name: 'pdf-viewer',
    path: '/:filePath*',
    component: App,
    meta: {
      auth: false,
      patchCleanPath: true
    }
  }
]

const appInfo = {
  name: 'PDF viewer',
  id: 'pdf-viewer',
  icon: 'eye',
  extensions: [
    {
      extension: 'pdf',
      newTab: true,
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
