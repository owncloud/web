// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import translations from '../l10n/translations.json'
import { ApplicationInformation, ComponentLoader, defineWebApplication } from '@ownclouders/web-pkg'
import { extensions } from './extensions'
import { extensionPoints } from './extensionPoints'
import { useGettext } from 'vue3-gettext'

export default defineWebApplication({
  setup() {
    const { $gettext } = useGettext()

    const appInfo: ApplicationInformation = {
      name: $gettext('Search'),
      id: 'search',
      icon: 'folder',
      isFileEditor: false
    }

    return {
      appInfo,
      routes: [
        {
          name: 'search',
          path: '/',
          component: ComponentLoader(async () => (await import('./App.vue')).default),
          children: [
            {
              name: 'provider-list',
              path: 'list/:page?',
              component: ComponentLoader(async () => (await import('./views/List.vue')).default),
              meta: {
                authContext: 'user',
                contextQueryItems: ['term', 'provider']
              }
            }
          ]
        }
      ],
      translations,
      extensions: extensions(),
      extensionPoints: extensionPoints()
    }
  }
})
