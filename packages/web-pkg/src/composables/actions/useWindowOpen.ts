import { useGettext } from 'vue3-gettext'
import { useStore } from '@ownclouders/web-pkg/src/composables'

export const useWindowOpen = () => {
  const { $gettext } = useGettext()
  const store = useStore()

  const openUrl = (url: string, target?: string, shouldFocus?: boolean) => {
    const win = window.open(url, target)

    if (!win) {
      store.dispatch('showMessage', {
        title: $gettext('Pop-up and redirect block detected'),
        timeout: 20,
        status: 'warning',
        desc: $gettext(
          'Please turn on pop-ups and redirects in your browser settings to make sure everything works right.'
        )
      })
    } else if (shouldFocus) {
      win.focus()
    }
  }

  return { openUrl }
}
