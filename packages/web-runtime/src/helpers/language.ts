import { Language } from 'vue3-gettext'

export const setCurrentLanguage = ({
  language,
  languageSetting = null,
  user = null
}: {
  language: Language
  languageSetting?: string
  user?: any
}): void => {
  let currentLanguage = languageSetting || user?.language
  if (currentLanguage) {
    if (currentLanguage.indexOf('-')) {
      currentLanguage = currentLanguage.split('-')[0]
    }
    language.current = currentLanguage
    document.documentElement.lang = currentLanguage
  }
}
