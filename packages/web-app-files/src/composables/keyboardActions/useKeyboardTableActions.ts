import { Key, KeyboardActions, ModifierKey, useClipboardStore } from '@ownclouders/web-pkg'
import { useStore } from '@ownclouders/web-pkg'

export const useKeyboardTableActions = (keyActions: KeyboardActions) => {
  const store = useStore()
  const { copyResources } = useClipboardStore()

  keyActions.bindKeyAction({ modifier: ModifierKey.Ctrl, primary: Key.C }, () => {
    copyResources(store.getters['Files/selectedFiles'])
  })
}
