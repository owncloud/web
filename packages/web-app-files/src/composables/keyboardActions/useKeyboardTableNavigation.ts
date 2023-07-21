import { useStore } from 'web-pkg'
import { useScrollTo } from 'web-app-files/src/composables/scrollTo'
import { computed, Ref, unref } from 'vue'
import { Key, KeyboardActions, ModifierKey } from 'web-pkg/src/composables/keyboardActions'
import { Resource } from 'web-client'

export const useKeyboardTableNavigation = (
  keyActions: KeyboardActions,
  paginatedResources: Ref<Resource[]>
) => {
  const store = useStore()
  const { scrollToResource } = useScrollTo()
  const latestSelectedId = computed(() => store.state.Files.latestSelectedId)

  keyActions.bindKeyAction({ primary: Key.ArrowUp }, () => handleNavigateAction(true))

  keyActions.bindKeyAction({ primary: Key.ArrowDown }, () => handleNavigateAction())

  keyActions.bindKeyAction({ modifier: ModifierKey.Shift, primary: Key.ArrowUp }, () =>
    handleShiftUpAction()
  )

  keyActions.bindKeyAction({ modifier: ModifierKey.Shift, primary: Key.ArrowDown }, () =>
    handleShiftDownAction()
  )

  keyActions.bindKeyAction({ modifier: ModifierKey.Ctrl, primary: Key.A }, () =>
    handleSelectAllAction()
  )

  keyActions.bindKeyAction({ primary: Key.Space }, () => {
    store.dispatch('Files/toggleFileSelection', { id: unref(latestSelectedId) })
  })

  keyActions.bindKeyAction({ primary: Key.Esc }, () => {
    keyActions.resetSelectionCursor()
    store.dispatch('Files/resetFileSelection')
  })

  const handleNavigateAction = async (up = false) => {
    const nextId = !unref(latestSelectedId) ? getFirstResourceId() : getNextResourceId(up)
    if (nextId === -1) {
      return
    }
    keyActions.resetSelectionCursor()
    await store.dispatch('Files/resetFileSelection')
    store.commit('Files/ADD_FILE_SELECTION', { id: nextId })
    scrollToResource({ id: nextId } as any)
  }

  const getNextResourceId = (previous = false) => {
    const latestSelectedResourceIndex = paginatedResources.value.findIndex(
      (resource) => resource.id === latestSelectedId.value
    )
    if (latestSelectedResourceIndex === -1) {
      return -1
    }
    const nextResourceIndex = latestSelectedResourceIndex + (previous ? -1 : 1)
    if (nextResourceIndex < 0 || nextResourceIndex >= paginatedResources.value.length) {
      return -1
    }
    return paginatedResources.value[nextResourceIndex].id
  }

  const getFirstResourceId = () => {
    return paginatedResources.value.length ? paginatedResources.value[0].id : -1
  }

  const handleSelectAllAction = () => {
    keyActions.resetSelectionCursor()
    store.commit('Files/SET_FILE_SELECTION', paginatedResources.value)
  }

  const handleShiftUpAction = async () => {
    const nextResourceId = getNextResourceId(true)
    if (nextResourceId === -1) {
      return
    }
    if (unref(keyActions.selectionCursor) > 0) {
      // deselect
      await store.dispatch('Files/toggleFileSelection', { id: unref(latestSelectedId) })
      store.commit('Files/SET_LATEST_SELECTED_FILE_ID', nextResourceId)
    } else {
      // select
      store.commit('Files/ADD_FILE_SELECTION', { id: nextResourceId })
    }
    scrollToResource({ id: nextResourceId } as any)
    keyActions.selectionCursor.value = unref(keyActions.selectionCursor) - 1
  }
  const handleShiftDownAction = () => {
    const nextResourceId = getNextResourceId()
    if (nextResourceId === -1) {
      return
    }
    if (unref(keyActions.selectionCursor) < 0) {
      // deselect
      store.dispatch('Files/toggleFileSelection', { id: unref(latestSelectedId) })
      store.commit('Files/SET_LATEST_SELECTED_FILE_ID', nextResourceId)
    } else {
      // select
      store.commit('Files/ADD_FILE_SELECTION', { id: nextResourceId })
    }
    scrollToResource({ id: nextResourceId } as any)
    keyActions.selectionCursor.value = unref(keyActions.selectionCursor) + 1
  }
}
