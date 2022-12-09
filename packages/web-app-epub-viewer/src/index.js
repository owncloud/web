import translations from '../l10n/translations'
import App from './App.vue'

// just a dummy function to trick gettext tools
function $gettext(msg) {
  return msg
}

const routes = [
  {
    path: '/:driveAliasAndItem*',
    component: App,
    name: 'epub-viewer',
    meta: {
      authContext: 'hybrid',
      title: $gettext('EPUB Viewer'),
      patchCleanPath: true
    }
  }
]

const appInfo = {
  name: $gettext('EPUB Viewer'),
  id: 'epub-viewer',
  icon: 'resource-type-epub',
  iconFillType: 'fill',
  extensions: [
    {
      extension: 'epub',
      routeName: 'epub-viewer',
      canBeDefault: true
    }
  ]
}

export default {
  appInfo,
  routes,
  translations
}
