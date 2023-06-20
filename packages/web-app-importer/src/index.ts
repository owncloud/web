import translations from '../l10n/translations.json'
import { extensions } from './extensions'
import { useGettext } from 'vue3-gettext'
import { defineWebApplication } from '@ownclouders/web-pkg/src/apps'

export default defineWebApplication({
  setup({ applicationConfig }) {
    const { $gettext } = useGettext()
    return {
      appInfo: {
        id: 'importer',
        name: $gettext('Importer')
      },
      extensions: extensions({ applicationConfig }),
      translations
    }
  }
})
