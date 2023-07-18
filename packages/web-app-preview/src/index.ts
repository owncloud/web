import translations from '../l10n/translations.json'
import * as app from './App.vue'
import store from './store'
const { default: App, mimeTypes, appId } = app as any

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
    mimeType,
    routeName,
    label: $gettext('Preview')
  }))
}

export default {
  appInfo,
  routes,
  translations,
  mimeTypes,
  store
}
