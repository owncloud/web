import {
  Key,
  KeyboardActions,
  ModifierKey,
  useClipboardStore,
  useResourcesStore
} from '@ownclouders/web-pkg'

export const useKeyboardTableActions = (keyActions: KeyboardActions) => {
  const resourcesStore = useResourcesStore()
  const { copyResources } = useClipboardStore()

  keyActions.bindKeyAction({ modifier: ModifierKey.Ctrl, primary: Key.C }, () => {
    copyResources(resourcesStore.selectedResources)
  })
}
