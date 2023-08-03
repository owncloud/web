import { useStore, ViewModeConstants } from 'web-pkg'
import { useScrollTo } from 'web-app-files/src/composables/scrollTo'
import { computed, Ref, ref, unref, nextTick, watchEffect } from 'vue'
import { Key, KeyboardActions, ModifierKey } from 'web-pkg/src/composables/keyboardActions'
import { Resource } from 'web-client'

export const useKeyboardTableNavigation = (
  keyActions: KeyboardActions,
  paginatedResources: Ref<Resource[]>,
  viewMode: any
) => {
  const store = useStore()
  const { scrollToResource } = useScrollTo()
  const latestSelectedId = computed(() => store.state.Files.latestSelectedId)
  const bindKeyActionsIds = ref([])

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

  watchEffect(() => {
    bindKeyActionsIds.value.forEach((id) => keyActions.removeKeyAction(id))
    bindKeyActionsIds.value = []

    if (ViewModeConstants.tilesView.name === viewMode.value) {
      bindKeyActionsIds.value.push(
        keyActions.bindKeyAction({ primary: Key.ArrowLeft }, () => tilesHandleNavigateLeft())
      )
      bindKeyActionsIds.value.push(
        keyActions.bindKeyAction({ primary: Key.ArrowRight }, () => tilesHandleNavigateRight())
      )
      bindKeyActionsIds.value.push(
        keyActions.bindKeyAction({ primary: Key.ArrowUp }, () => tilesHandleNavigateUp())
      )
      bindKeyActionsIds.value.push(
        keyActions.bindKeyAction({ primary: Key.ArrowDown }, () => tilesHandleNavigateDown())
      )
    } else {
      bindKeyActionsIds.value.push(
        keyActions.bindKeyAction({ primary: Key.ArrowUp }, () => tableHandleNavigateAction(true))
      )

      bindKeyActionsIds.value.push(
        keyActions.bindKeyAction({ primary: Key.ArrowDown }, () => tableHandleNavigateAction())
      )

      bindKeyActionsIds.value.push(
        keyActions.bindKeyAction({ modifier: ModifierKey.Shift, primary: Key.ArrowUp }, () =>
          handleShiftUpAction()
        )
      )

      bindKeyActionsIds.value.push(
        keyActions.bindKeyAction({ modifier: ModifierKey.Shift, primary: Key.ArrowDown }, () =>
          handleShiftDownAction()
        )
      )
    }
  })

  const tilesHandleNavigateLeft = () => {}
  const tilesHandleNavigateRight = () => {}
  const tilesHandleNavigateUp = () => {}
  const tilesHandleNavigateDown = () => {}

  const tableHandleNavigateAction = async (up = false) => {
    const nextId = !unref(latestSelectedId) ? getFirstResourceId() : getNextResourceId(up)
    if (nextId === -1) {
      return
    }
    keyActions.resetSelectionCursor()
    store.dispatch('Files/resetFileSelection')
    await nextTick()
    store.commit('Files/ADD_FILE_SELECTION', { id: nextId })
    await nextTick()
    scrollToResource(nextId)
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
    scrollToResource(nextResourceId)
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
    scrollToResource(nextResourceId)
    keyActions.selectionCursor.value = unref(keyActions.selectionCursor) + 1
  }
}
