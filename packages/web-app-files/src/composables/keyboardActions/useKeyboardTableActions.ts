import { Key, KeyboardActions, ModifierKey } from 'web-pkg/src/composables/keyboardActions'
import { useStore } from 'web-pkg/src/composables'
import { useGettext } from 'vue3-gettext'

export const useKeyboardTableActions = (keyActions: KeyboardActions) => {
  const store = useStore()
  const language = useGettext()

  keyActions.bindKeyAction({ modifier: ModifierKey.Ctrl, primary: Key.C }, () => {
    store.dispatch('Files/copySelectedFiles', {
      ...language,
      resources: store.getters['Files/selectedFiles']
    })
  })
}
