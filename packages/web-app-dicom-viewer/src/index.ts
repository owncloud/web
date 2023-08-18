import translations from '../l10n/translations.json'
import { AppWrapperRoute } from 'web-pkg/src/components/AppTemplates/AppWrapperRoute'
import DicomViewer from './DicomViewer.vue'

// just a dummy function to trick gettext tools
function $gettext(msg) {
  return msg
}

const routes = [
  {
    path: '/:driveAliasAndItem(.*)?',
    component: AppWrapperRoute(DicomViewer, {
      applicationId: 'dicom-viewer',
      urlForResourceOptions: {
        //disposition: 'inline'
      }
    }),
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
  extensions: [
    {
      extension: 'dcm',
      routeName: 'dicom-viewer'
    }
  ]
}

export default {
  appInfo,
  routes,
  translations
}
