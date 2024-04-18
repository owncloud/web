import {
  Key,
  KeyboardActions,
  Modifier,
  useClipboardStore,
  useResourcesStore
} from '@ownclouders/web-pkg'
import { SpaceResource } from '@ownclouders/web-client'
import { unref } from 'vue'
import { useFileActionsPaste } from '@ownclouders/web-pkg'

export const useKeyboardTableSpaceActions = (keyActions: KeyboardActions, space: SpaceResource) => {
  const { copyResources, cutResources } = useClipboardStore()
  const resourcesStore = useResourcesStore()

  const { actions: pasteFileActions } = useFileActionsPaste()
  const pasteFileAction = unref(pasteFileActions)[0].handler

  keyActions.bindKeyAction({ modifier: Modifier.Ctrl, primary: Key.C }, () => {
    copyResources(resourcesStore.selectedResources)
  })

  keyActions.bindKeyAction({ modifier: Modifier.Ctrl, primary: Key.V }, () => {
    pasteFileAction({ space: space })
  })

  keyActions.bindKeyAction({ modifier: Modifier.Ctrl, primary: Key.X }, () => {
    cutResources(resourcesStore.selectedResources)
  })
}
