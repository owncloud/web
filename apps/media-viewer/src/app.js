import '@babel/polyfill'
import translationsJson from '../l10n/translations'

import Mediaviewer from './Mediaviewer.vue'

const routes = [{
  path: `/mediaviewer`,
  components: {
    app: Mediaviewer
  },
  name: 'mediaviewer'
}]

const appInfo = {
  name: 'Mediaviewer',
  id: 'mediaviewer',
  icon: 'image',
  extensions: [{
    extension: 'png'
  }, {
    extension: 'jpg'
  }, {
    extension: 'jpeg'
  }, {
    extension: 'gif'
  }]
}

const translations = translationsJson
export default define({
  appInfo,
  routes,
  translations
})
