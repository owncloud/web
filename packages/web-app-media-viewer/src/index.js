import translationsJson from '../l10n/translations'

import App from './App.vue'

const routes = [
  {
    path: '/:contextRouteName/:filePath',
    components: {
      app: App
    },
    name: 'mediaviewer/media',
    meta: { auth: false }
  }
]

const appInfo = {
  name: 'Mediaviewer',
  id: 'mediaviewer',
  icon: 'image',
  extensions: [
    {
      extension: 'png',
      routeName: 'mediaviewer/media',
      routes: [
        'files-personal',
        'files-favorites',
        'files-shared-with-others',
        'files-shared-with-me',
        'files-public-list'
      ]
    },
    {
      extension: 'jpg',
      routeName: 'mediaviewer/media',
      routes: [
        'files-personal',
        'files-favorites',
        'files-shared-with-others',
        'files-shared-with-me',
        'files-public-list'
      ]
    },
    {
      extension: 'jpeg',
      routeName: 'mediaviewer/media',
      routes: [
        'files-personal',
        'files-favorites',
        'files-shared-with-others',
        'files-shared-with-me',
        'files-public-list'
      ]
    },
    {
      extension: 'gif',
      routeName: 'mediaviewer/media',
      routes: [
        'files-personal',
        'files-favorites',
        'files-shared-with-others',
        'files-shared-with-me',
        'files-public-list'
      ]
    },
    {
      extension: 'mp4',
      routeName: 'mediaviewer/media',
      routes: [
        'files-personal',
        'files-favorites',
        'files-shared-with-others',
        'files-shared-with-me',
        'files-public-list'
      ]
    },
    {
      extension: 'webm',
      routeName: 'mediaviewer/media',
      routes: [
        'files-personal',
        'files-favorites',
        'files-shared-with-others',
        'files-shared-with-me',
        'files-public-list'
      ]
    },
    {
      extension: 'ogg',
      routeName: 'mediaviewer/media',
      routes: [
        'files-personal',
        'files-favorites',
        'files-shared-with-others',
        'files-shared-with-me',
        'files-public-list'
      ]
    }
  ]
}

const translations = translationsJson
export default {
  appInfo,
  routes,
  translations
}
