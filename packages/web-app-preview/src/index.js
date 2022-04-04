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
    name: 'media',
    meta: {
      auth: false,
      title: $gettext('Preview'),
      patchCleanPath: true
    }
  }
]

const routeName = 'preview-media'
const mimeTypes = ['image', 'video', 'audio']

const appInfo = {
  name: 'Preview',
  id: 'preview',
  icon: 'eye',
  extensions: mimeTypes.map((mimeType) => ({
    canBeDefault: true,
    mimeType,
    routeName
  }))
}

export default {
  appInfo,
  routes,
  translations,
  mimeTypes
}
