import translations from '../l10n/translations.json'
import App from './App.vue'

// just a dummy function to trick gettext tools
function $gettext(msg) {
  return msg
}

const routes = [
  {
    path: '/:driveAliasAndItem(.*)?',
    component: App,
    name: 'dicom-viewer',
    meta: {
      authContext: 'hybrid',
      title: $gettext('DICOM Viewer'),
      patchCleanPath: true
    }
  }
]

const appInfo = {
  name: $gettext('DICOM Viewer'),
  id: 'dicom-viewer',
  icon: 'resource-type-medical',
  iconFillType: 'fill',
  iconColor: 'var(--oc-color-icon-medical)',
  isFileEditor: true,
  extensions: [
    {
      extension: 'dcm',
      routeName: 'dicom-viewer'
    }
  ]
  //fileSideBars
}

export default {
  appInfo,
  routes,
  translations
}
