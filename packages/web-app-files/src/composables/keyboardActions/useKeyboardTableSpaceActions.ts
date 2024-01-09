import { Key, KeyboardActions, ModifierKey, useMessages } from '@ownclouders/web-pkg'
import { SpaceResource } from '@ownclouders/web-client'
import { useStore } from '@ownclouders/web-pkg'
import { useGettext } from 'vue3-gettext'
import { unref } from 'vue'
import { useFileActionsPaste } from '@ownclouders/web-pkg'

export const useKeyboardTableSpaceActions = (keyActions: KeyboardActions, space: SpaceResource) => {
  const store = useStore()
  const messageStore = useMessages()
  const language = useGettext()

  const { actions: pasteFileActions } = useFileActionsPaste({ store })
  const pasteFileAction = unref(pasteFileActions)[0].handler

  keyActions.bindKeyAction({ modifier: ModifierKey.Ctrl, primary: Key.C }, () => {
    store.dispatch('Files/copySelectedFiles', {
      ...language,
      space: space,
      resources: store.getters['Files/selectedFiles'],
      messageStore
    })
  })

  keyActions.bindKeyAction({ modifier: ModifierKey.Ctrl, primary: Key.V }, () => {
    pasteFileAction({ space: space })
  })

  keyActions.bindKeyAction({ modifier: ModifierKey.Ctrl, primary: Key.X }, () => {
    store.dispatch('Files/cutSelectedFiles', {
      ...language,
      space: space,
      resources: store.getters['Files/selectedFiles'],
      messageStore
    })
  })
}
