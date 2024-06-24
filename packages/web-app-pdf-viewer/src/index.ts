import translations from '../l10n/translations.json'
import { AppWrapperRoute, ComponentLoader } from '@ownclouders/web-pkg'

// just a dummy function to trick gettext tools
function $gettext(msg: string) {
  return msg
}

const routes = [
  {
    path: '/:driveAliasAndItem(.*)?',
    component: ComponentLoader(async () => {
      const PdfViewer = (await import('./App.vue')).default
      return AppWrapperRoute(PdfViewer, {
        applicationId: 'pdf-viewer',
        urlForResourceOptions: {
          disposition: 'inline'
        }
      })
    }),
    name: 'pdf-viewer',
    meta: {
      authContext: 'hybrid',
      title: $gettext('PDF Viewer'),
      patchCleanPath: true
    }
  }
]

const appInfo = {
  name: $gettext('PDF Viewer'),
  id: 'pdf-viewer',
  icon: 'resource-type-pdf',
  iconFillType: 'fill',
  iconColor: 'var(--oc-color-icon-pdf)',
  extensions: [
    {
      extension: 'pdf',
      routeName: 'pdf-viewer'
    }
  ]
}

export default {
  appInfo,
  routes,
  translations
}
