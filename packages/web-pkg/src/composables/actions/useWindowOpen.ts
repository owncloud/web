import { useGettext } from 'vue3-gettext'
import { useStore } from 'web-pkg/src/composables'

const openUrl = (url: string, target?: string, shouldFocus?: boolean) => {
  const { $gettext } = useGettext()
  const store = useStore()

  const win = window.open(url, target)

  if (win && shouldFocus) {
    win.focus()
  } else {
    store.dispatch('showMessage', {
      title: $gettext('Pop-up and redirect block detected'),
      timeout: 20,
      status: 'warning',
      desc: $gettext(
        'Please turn on pop-ups and redirects in your browser settings to make sure everything works right.'
      )
    })
  }
}

export const useWindowOpen = {
  openUrl
}
