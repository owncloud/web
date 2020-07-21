import '@babel/polyfill'
import translationsJson from '../l10n/translations'

import Mediaviewer from './Mediaviewer.vue'

const routes = [
  {
    path: '/:contextRouteName/:filePath',
    components: {
      app: Mediaviewer
    },
    name: 'mediaviewer/image',
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
      routeName: 'image'
    },
    {
      extension: 'jpg',
      routeName: 'image'
    },
    {
      extension: 'jpeg',
      routeName: 'image'
    },
    {
      extension: 'gif',
      routeName: 'image'
    },
    {
      extension: 'mp4',
      routeName: 'image'
    },
    {
      extension: 'webn',
      routeName: 'image'
    },
    {
      extension: 'ogg',
      routeName: 'image'
    }
  ]
}

const translations = translationsJson
export default define({
  appInfo,
  routes,
  translations
})
