import { useService } from '../service'

export const useTranslations = () => {
  return {
    $gettext: useService('$gettext'),
    $pgettext: useService('$pgettext'),
    $ngettext: useService('$ngettext'),
    $gettextInterpolate: useService('$gettextInterpolate')
  }
}
