import { Key, KeyboardActions, ModifierKey, useMessages } from '@ownclouders/web-pkg'
import { useStore } from '@ownclouders/web-pkg'
import { useGettext } from 'vue3-gettext'

export const useKeyboardTableActions = (keyActions: KeyboardActions) => {
  const store = useStore()
  const messageStore = useMessages()
  const language = useGettext()

  keyActions.bindKeyAction({ modifier: ModifierKey.Ctrl, primary: Key.C }, () => {
    store.dispatch('Files/copySelectedFiles', {
      ...language,
      resources: store.getters['Files/selectedFiles'],
      messageStore
    })
  })
}
