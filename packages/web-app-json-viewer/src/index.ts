import { AppWrapperRoute } from '@ownclouders/web-pkg'
import JsonViewer from './App.vue'

// just a dummy function to trick gettext tools
function $gettext(msg: string) {
  return msg
}

const routes = [
  {
    path: '/:driveAliasAndItem(.*)?',
    component: AppWrapperRoute(JsonViewer, {
      applicationId: 'json-viewer'
    }),
    name: 'json-viewer',
    meta: {
      authContext: 'hybrid',
      title: $gettext('JSON Viewer'),
      patchCleanPath: true
    }
  }
]

const appInfo = {
  name: $gettext('JSON Viewer'),
  id: 'json-viewer',
  icon: 'file-code',
  iconFillType: 'fill',
  extensions: [
    {
      extension: 'json',
      routeName: 'json-viewer'
    }
  ]
}

export default {
  appInfo,
  routes
}
