let pdf = import('./PdfViewer.vue')
const PdfViewer = () => ({
  component: pdf
})

const routes = [{
  path: `/pdf-viewer`,
  component: PdfViewer,
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
