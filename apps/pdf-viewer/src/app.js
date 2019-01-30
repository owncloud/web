import PdfViewerComponent from './PdfViewer.vue'

const routes = [{
  path: `/pdf-viewer`,
  component: PdfViewerComponent,
  name: 'pdf-viewer'
}]

const appInfo = {
  name: 'PDF Viewer',
  id: 'pdf-viewer',
  icon: 'ocft icon-application-pdf',
  isFileEditor: true,
  extensions: [{
    extension: 'pdf'
  }
  ] }

export default define({
  appInfo,
  routes
})
