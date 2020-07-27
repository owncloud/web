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
      routeName: 'media'
    },
    {
      extension: 'jpg',
      routeName: 'media'
    },
    {
      extension: 'jpeg',
      routeName: 'media'
    },
    {
      extension: 'gif',
      routeName: 'media'
    },
    {
      extension: 'mp4',
      routeName: 'media'
    },
    {
      extension: 'webn',
      routeName: 'media'
    },
    {
      extension: 'ogg',
      routeName: 'media'
    }
  ]
}

const translations = translationsJson
export default define({
  appInfo,
  routes,
  translations
})
