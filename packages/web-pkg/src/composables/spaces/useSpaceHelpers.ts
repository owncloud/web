import { useStore } from '@ownclouders/web-pkg/src/composables'
import { useGettext } from 'vue3-gettext'

export const useSpaceHelpers = () => {
  const store = useStore()
  const { $gettext } = useGettext()

  const checkSpaceNameModalInput = (name) => {
    if (name.trim() === '') {
      return store.dispatch('setModalInputErrorMessage', $gettext('Space name cannot be empty'))
    }
    if (name.length > 255) {
      return store.dispatch(
        'setModalInputErrorMessage',
        $gettext('Space name cannot exceed 255 characters')
      )
    }
    if (/[/\\.:?*"><|]/.test(name)) {
      return store.dispatch(
        'setModalInputErrorMessage',
        $gettext('Space name cannot contain the following characters: / \\\\ . : ? * " > < |\'')
      )
    }
    store.dispatch('setModalInputErrorMessage', null)
  }

  return { checkSpaceNameModalInput }
}
