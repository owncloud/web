import { getCurrentInstance } from 'vue'

export const useTranslations = () => {
  const p = getCurrentInstance().proxy as any
  return {
    $gettext: p.$gettext,
    $pgettext: p.$pgettext,
    $ngettext: p.$ngettext,
    $gettextInterpolate: p.$gettextInterpolate
  }
}
