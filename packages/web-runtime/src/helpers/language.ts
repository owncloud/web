import { Language } from 'vue3-gettext'

export const setCurrentLanguage = ({
  language,
  languageSetting = null,
  user = null
}: {
  language: Language
  languageSetting?: Record<string, any>
  user?: any
}): void => {
  let currentLanguage = languageSetting?.value?.listValue?.values[0]?.stringValue || user?.language
  if (currentLanguage) {
    if (currentLanguage.indexOf('_')) {
      currentLanguage = currentLanguage.split('_')[0]
    }
    language.current = currentLanguage
    document.documentElement.lang = currentLanguage
  }
}
