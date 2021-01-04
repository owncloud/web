import translationsJson from '../l10n/translations'

import Mediaviewer from './Mediaviewer.vue'

const routes = [
  {
    path: '/:contextRouteName/:filePath',
    components: {
      app: Mediaviewer
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
        'files-list',
        'files-favorites',
        'files-shared-with-others',
        'files-shared-with-me',
        'public-files'
      ]
    },
    {
      extension: 'jpg',
      routeName: 'mediaviewer/media',
      routes: [
        'files-list',
        'files-favorites',
        'files-shared-with-others',
        'files-shared-with-me',
        'public-files'
      ]
    },
    {
      extension: 'jpeg',
      routeName: 'mediaviewer/media',
      routes: [
        'files-list',
        'files-favorites',
        'files-shared-with-others',
        'files-shared-with-me',
        'public-files'
      ]
    },
    {
      extension: 'gif',
      routeName: 'mediaviewer/media',
      routes: [
        'files-list',
        'files-favorites',
        'files-shared-with-others',
        'files-shared-with-me',
        'public-files'
      ]
    },
    {
      extension: 'mp4',
      routeName: 'mediaviewer/media',
      routes: [
        'files-list',
        'files-favorites',
        'files-shared-with-others',
        'files-shared-with-me',
        'public-files'
      ]
    },
    {
      extension: 'webm',
      routeName: 'mediaviewer/media',
      routes: [
        'files-list',
        'files-favorites',
        'files-shared-with-others',
        'files-shared-with-me',
        'public-files'
      ]
    },
    {
      extension: 'ogg',
      routeName: 'mediaviewer/media',
      routes: [
        'files-list',
        'files-favorites',
        'files-shared-with-others',
        'files-shared-with-me',
        'public-files'
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
