import translations from '../l10n/translations.json'
import { extensions } from './extensions'
import { useGettext } from 'vue3-gettext'
import { defineWebApplication } from '@ownclouders/web-pkg'

export default defineWebApplication({
  setup(args) {
    const { $gettext } = useGettext()
    return {
      appInfo: {
        id: 'importer',
        name: $gettext('Importer')
      },
      extensions: extensions(args),
      translations
    }
  }
})
