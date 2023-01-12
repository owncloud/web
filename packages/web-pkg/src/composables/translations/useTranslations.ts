import { useService } from '../service'

export const useTranslations = (): {
  $gettext: (msgid: string) => string
  $pgettext: (context: string, msgid: string) => string
  $ngettext: (msgid: string, plural: string, n: number) => string
  $gettextInterpolate: (msgid: string, context: object, disableHtmlEscaping?: boolean) => string
} => {
  return {
    $gettext: useService('$gettext'),
    $pgettext: useService('$pgettext'),
    $ngettext: useService('$ngettext'),
    $gettextInterpolate: useService('$gettextInterpolate'),
    $language: useService('$language')
  }
}
