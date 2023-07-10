import { useGettext } from 'vue3-gettext'

export const useBlockedPopupRedirectMessage = () => {
  const { $gettext } = useGettext()

  return {
    title: $gettext('Blocked pop-ups and redirects'),
    timeout: 20,
    status: 'warning',
    desc: $gettext(
      'Some features might not work correctly. Please enable pop-ups and redirects in Settings > Privacy & Security > Site Settings > Permissions'
    )
  }
}
