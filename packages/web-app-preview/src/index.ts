import translations from '../l10n/translations.json'
import App, { mimeTypes, appId } from './App.vue'

// just a dummy function to trick gettext tools
function $gettext(msg) {
  return msg
}

const routes = [
  {
    path: '/:driveAliasAndItem(.*)?',
    component: App,
    name: 'media',
    meta: {
      authContext: 'hybrid',
      title: $gettext('Preview'),
      patchCleanPath: true
    }
  }
]

const routeName = 'preview-media'

const appInfo = {
  name: $gettext('Preview'),
  id: appId,
  icon: 'eye',
  extensions: mimeTypes().map((mimeType) => ({
    canBeDefault: true,
    mimeType,
    routeName,
    label: $gettext('Preview')
  }))
}

export default {
  appInfo,
  routes,
  translations,
  mimeTypes
}
