import { translate } from 'vue-gettext'
import translations from '../l10n/translations.json'

const config = {
  language: 'de', // TODO BEFORE MERGE: Access current locale
  getTextPluginSilent: false,
  getTextPluginMuteLanguages: [],
  silent: false
}

translate.initTranslations(translations, config)

// easygettext aliases
export const { gettext: $gettext, ngettext: $ngettext } = translate
