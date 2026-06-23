import { useGettext } from 'vue3-gettext'
import translations from '../l10n/translations.json'
import HtmlEditor from './App.vue'
import {
  AppWrapperRoute,
  ApplicationFileExtension,
  ApplicationInformation,
  defineWebApplication
} from '@ownclouders/web-pkg'

export default defineWebApplication({
  setup() {
    const { $gettext } = useGettext()

    const appId = 'html-editor'

    // `newFileMenu` on the html entry adds a "New > HTML file" item to the Files
    // create menu. The extensions also declare which file types open in this app.
    const htmlFileLabel = () => $gettext('HTML file')
    const fileExtensions: ApplicationFileExtension[] = [
      {
        extension: 'html',
        label: htmlFileLabel,
        newFileMenu: {
          menuTitle: htmlFileLabel
        }
      },
      {
        extension: 'htm',
        label: htmlFileLabel
      },
      {
        extension: 'xhtml',
        label: () => $gettext('XHTML file')
      }
    ]

    const routes = [
      {
        path: '/:driveAliasAndItem(.*)?',
        component: AppWrapperRoute(HtmlEditor, {
          applicationId: appId
        }),
        name: 'html-editor',
        meta: {
          authContext: 'hybrid',
          title: $gettext('HTML Editor'),
          patchCleanPath: true
        }
      }
    ]

    const appInfo: ApplicationInformation = {
      name: $gettext('HTML Editor'),
      id: appId,
      icon: 'file-code',
      color: '#e34c26',
      defaultExtension: 'html',
      meta: {
        fileSizeLimit: 2000000
      },
      extensions: fileExtensions
    }

    return {
      appInfo,
      routes,
      translations
    }
  }
})
