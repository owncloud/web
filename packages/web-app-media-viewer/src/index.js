import translations from '../l10n/translations'
import App from './App.vue'

// just a dummy function to trick gettext tools
function $gettext(msg) {
  return msg
}

const routes = [
  {
    path: '/:contextRouteName/:filePath*',
    components: {
      app: App
    },
    name: 'media',
    meta: {
      auth: false,
      title: $gettext('Mediaviewer app'),
      patchCleanPath: true
    }
  }
]

const routeName = 'mediaviewer-media'

const routesForFileExtensions = [
  'files-spaces-storage',
  'files-common-favorites',
  'files-shares-with-others',
  'files-shares-with-me',
  'files-public-files'
]

const fileExtensionConfig = {
  canBeDefault: true,
  routeName,
  routes: routesForFileExtensions
}

const appInfo = {
  name: 'Mediaviewer',
  id: 'mediaviewer',
  icon: 'image',
  extensions: [
    {
      extension: 'png',
      ...fileExtensionConfig
    },
    {
      extension: 'jpg',
      ...fileExtensionConfig
    },
    {
      extension: 'jpeg',
      ...fileExtensionConfig
    },
    {
      extension: 'gif',
      ...fileExtensionConfig
    },
    {
      extension: 'mp4',
      ...fileExtensionConfig
    },
    {
      extension: 'webm',
      ...fileExtensionConfig
    },
    {
      extension: 'ogg',
      ...fileExtensionConfig
    }
  ]
}

export default {
  appInfo,
  routes,
  translations
}
