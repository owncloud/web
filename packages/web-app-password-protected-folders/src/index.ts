import { useGettext } from 'vue3-gettext'
import translations from '../l10n/translations.json'
import {
  defineWebApplication,
  PASSWORD_PROTECTED_FOLDER_FILE_EXTENSION
} from '@ownclouders/web-pkg'
import { useExtensions } from './composables/useExtensions'
import { useCustomHandler } from './composables/useCustomHandler'

export default defineWebApplication({
  setup() {
    const { $gettext } = useGettext()
    const extensions = useExtensions()
    const { customHandler } = useCustomHandler()

    return {
      appInfo: {
        name: $gettext('Password Protected Folders'),
        id: 'password-protected-folders',
        extensions: [
          {
            newFileMenu: { menuTitle: () => $gettext('Password Protected Folder') },
            extension: PASSWORD_PROTECTED_FOLDER_FILE_EXTENSION,
            customHandler
          }
        ]
      },
      translations,
      extensions
    }
  }
})
