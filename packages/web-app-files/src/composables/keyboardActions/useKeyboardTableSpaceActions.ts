import { Key, KeyboardActions, ModifierKey } from 'web-pkg/src/composables/keyboardActions'
import { SpaceResource } from 'web-client'
import { useStore } from 'web-pkg'
import { useGettext } from 'vue3-gettext'
import { unref } from 'vue'
import { useFileActionsPaste } from 'web-pkg/src/composables'

export const useKeyboardTableSpaceActions = (keyActions: KeyboardActions, space: SpaceResource) => {
  const store = useStore()
  const language = useGettext()

  const { actions: pasteFileActions } = useFileActionsPaste({ store })
  const pasteFileAction = unref(pasteFileActions)[0].handler

  keyActions.bindKeyAction({ modifier: ModifierKey.Ctrl, primary: Key.C }, () => {
    store.dispatch('Files/copySelectedFiles', {
      ...language,
      space: space,
      resources: store.getters['Files/selectedFiles']
    })
  })

  keyActions.bindKeyAction({ modifier: ModifierKey.Ctrl, primary: Key.V }, () => {
    pasteFileAction({ space: space })
  })

  keyActions.bindKeyAction({ modifier: ModifierKey.Ctrl, primary: Key.X }, () => {
    store.dispatch('Files/cutSelectedFiles', {
      ...language,
      space: space,
      resources: store.getters['Files/selectedFiles']
    })
  })
}
