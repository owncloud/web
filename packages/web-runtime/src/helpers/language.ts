import { Language } from 'vue3-gettext'

export const setCurrentLanguage = ({
  language,
  languageSetting = null
}: {
  language: Language
  languageSetting?: string
}): void => {
  let currentLanguage = languageSetting
  if (currentLanguage) {
    if (currentLanguage.indexOf('-')) {
      currentLanguage = currentLanguage.split('-')[0]
    }
    language.current = currentLanguage
    document.documentElement.lang = currentLanguage
  }
}
