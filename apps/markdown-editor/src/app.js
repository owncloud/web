import '@babel/polyfill'

// --- Components --------------------------------------------------------------

import MarkdownEditor from './MarkdownEditor.vue'
import MarkdownEditorTopbar from './MarkdownEditorTopbar.vue'
import t from '../l10n/translations'

// --- Routing -----------------------------------------------------------------

const store = require('./store.js')

const routes = [{
  path: '',
  components: {
    appContent: MarkdownEditor,
    appTopbar: MarkdownEditorTopbar
  },
  name: 'markdown-editor'
}]

const appInfo = {
  name: 'MarkdownEditor',
  id: 'markdown-editor',
  icon: 'text',
  isFileEditor: true,
  extensions: [{
    extension: 'txt'
  },
  {
    extension: 'md'
    // icon: 'custom_icon_class_to_override_icon_for_filetype_md'
  }
  ]
}

const translations = t
export default define({
  appInfo,
  routes,
  store,
  translations
})
