import '@babel/polyfill'
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
      routeName: 'media',
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
      routeName: 'media',
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
      routeName: 'media',
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
      routeName: 'media',
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
      routeName: 'media',
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
      routeName: 'media',
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
      routeName: 'media',
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
export default define({
  appInfo,
  routes,
  translations
})
