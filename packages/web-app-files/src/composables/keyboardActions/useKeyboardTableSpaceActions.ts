import { Key, KeyboardActions, ModifierKey, useClipboardStore } from '@ownclouders/web-pkg'
import { SpaceResource } from '@ownclouders/web-client'
import { useStore } from '@ownclouders/web-pkg'
import { unref } from 'vue'
import { useFileActionsPaste } from '@ownclouders/web-pkg'

export const useKeyboardTableSpaceActions = (keyActions: KeyboardActions, space: SpaceResource) => {
  const store = useStore()
  const { copyResources, cutResources } = useClipboardStore()

  const { actions: pasteFileActions } = useFileActionsPaste({ store })
  const pasteFileAction = unref(pasteFileActions)[0].handler

  keyActions.bindKeyAction({ modifier: ModifierKey.Ctrl, primary: Key.C }, () => {
    copyResources(store.getters['Files/selectedFiles'])
  })

  keyActions.bindKeyAction({ modifier: ModifierKey.Ctrl, primary: Key.V }, () => {
    pasteFileAction({ space: space })
  })

  keyActions.bindKeyAction({ modifier: ModifierKey.Ctrl, primary: Key.X }, () => {
    cutResources(store.getters['Files/selectedFiles'])
  })
}
