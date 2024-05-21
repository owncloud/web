import { Key, KeyboardActions, ModifierKey } from '@ownclouders/web-pkg'
import { SpaceResource } from '@ownclouders/web-client'
import { useStore } from '@ownclouders/web-pkg'
import { useGettext } from 'vue3-gettext'
import { unref } from 'vue'
import { useFileActionsPaste } from '@ownclouders/web-pkg'
import { Ref } from 'vue'

export const useKeyboardTableSpaceActions = (
  keyActions: KeyboardActions,
  space: Ref<SpaceResource>
) => {
  const store = useStore()
  const language = useGettext()

  const { actions: pasteFileActions } = useFileActionsPaste({ store })
  const pasteFileAction = unref(pasteFileActions)[0].handler

  keyActions.bindKeyAction({ modifier: ModifierKey.Ctrl, primary: Key.C }, () => {
    store.dispatch('Files/copySelectedFiles', {
      ...language,
      space: unref(space),
      resources: store.getters['Files/selectedFiles']
    })
  })

  keyActions.bindKeyAction({ modifier: ModifierKey.Ctrl, primary: Key.V }, () => {
    pasteFileAction({ space: unref(space) })
  })

  keyActions.bindKeyAction({ modifier: ModifierKey.Ctrl, primary: Key.X }, () => {
    store.dispatch('Files/cutSelectedFiles', {
      ...language,
      space: unref(space),
      resources: store.getters['Files/selectedFiles']
    })
  })
}
