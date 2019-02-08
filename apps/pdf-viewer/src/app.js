import '@babel/polyfill'
import PdfViewerTopbar from './PdfViewerTopbar.vue'
const store = require('./store.js')

let pdf = import('./PdfViewer.vue')
const PdfViewer = () => ({
  component: pdf
})

const routes = [{
  path: `/pdf-viewer`,
  components: {
    appContent: PdfViewer,
    appTopbar: PdfViewerTopbar
  },
  name: 'pdf-viewer'
}]

const appInfo = {
  name: 'PDFViewer',
  id: 'pdf-viewer',
  icon: 'ocft icon-application-pdf',
  isFileEditor: true,
  extensions: [{
    extension: 'pdf'
  }
  ] }

export default define({
  appInfo,
  routes,
  store
})
