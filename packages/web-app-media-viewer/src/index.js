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
  'files-personal',
  'files-favorites',
  'files-shared-with-others',
  'files-shared-with-me',
  'files-public-list'
]

const appInfo = {
  name: 'Mediaviewer',
  id: 'mediaviewer',
  icon: 'image',
  extensions: [
    {
      extension: 'png',
      routeName,
      routes: routesForFileExtensions
    },
    {
      extension: 'jpg',
      routeName,
      routes: routesForFileExtensions
    },
    {
      extension: 'jpeg',
      routeName,
      routes: routesForFileExtensions
    },
    {
      extension: 'gif',
      routeName,
      routes: routesForFileExtensions
    },
    {
      extension: 'mp4',
      routeName,
      routes: routesForFileExtensions
    },
    {
      extension: 'webm',
      routeName,
      routes: routesForFileExtensions
    },
    {
      extension: 'ogg',
      routeName,
      routes: routesForFileExtensions
    }
  ]
}

export default {
  appInfo,
  routes,
  translations
}
