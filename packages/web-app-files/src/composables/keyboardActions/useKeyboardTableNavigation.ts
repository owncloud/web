import { useStore, ViewModeConstants } from 'web-pkg'
import { useScrollTo } from 'web-app-files/src/composables/scrollTo'
import { computed, Ref, ref, unref, nextTick, watchEffect } from 'vue'
import { Key, KeyboardActions, ModifierKey } from 'web-pkg/src/composables/keyboardActions'
import { Resource } from 'web-client'

export const useKeyboardTableNavigation = (
  keyActions: KeyboardActions,
  paginatedResources: Ref<Resource[]>,
  viewMode: Ref<string>
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

  const bindTilesViewKeyActions = () => {
    bindKeyActionsIds.value.push(
      keyActions.bindKeyAction({ primary: Key.ArrowLeft }, () => handleNavigateAction(true))
    )

    bindKeyActionsIds.value.push(
      keyActions.bindKeyAction({ primary: Key.ArrowRight }, () => handleNavigateAction())
    )

    bindKeyActionsIds.value.push(
      keyActions.bindKeyAction({ primary: Key.ArrowUp }, () => {
        const elementsInRow = getElementsInRow()
        if (elementsInRow === -1) {
          return
        }
        handleNavigateAction(true, elementsInRow)
      })
    )

    bindKeyActionsIds.value.push(
      keyActions.bindKeyAction({ primary: Key.ArrowDown }, () => {
        const elementsInRow = getElementsInRow()
        if (elementsInRow === -1) {
          return
        }
        handleNavigateAction(false, elementsInRow)
      })
    )

    bindKeyActionsIds.value.push(
      keyActions.bindKeyAction({ modifier: ModifierKey.Shift, primary: Key.ArrowLeft }, () =>
        handleShiftUpAction()
      )
    )
    bindKeyActionsIds.value.push(
      keyActions.bindKeyAction({ modifier: ModifierKey.Shift, primary: Key.ArrowRight }, () =>
        handleShiftDownAction()
      )
    )

    bindKeyActionsIds.value.push(
      keyActions.bindKeyAction({ modifier: ModifierKey.Shift, primary: Key.ArrowUp }, () => {
        const elementsInRow = getElementsInRow()
        if (elementsInRow === -1) {
          return
        }
        handleShiftUpAction(elementsInRow)
      })
    )

    bindKeyActionsIds.value.push(
      keyActions.bindKeyAction({ modifier: ModifierKey.Shift, primary: Key.ArrowDown }, () => {
        const elementsInRow = getElementsInRow()
        if (elementsInRow === -1) {
          return
        }
        handleShiftDownAction(elementsInRow)
      })
    )
  }

  const bindTableViewKeyActions = () => {
    bindKeyActionsIds.value.push(
      keyActions.bindKeyAction({ primary: Key.ArrowUp }, () => handleNavigateAction(true))
    )

    bindKeyActionsIds.value.push(
      keyActions.bindKeyAction({ primary: Key.ArrowDown }, () => handleNavigateAction())
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

  const handleNavigateAction = async (up = false, moveBy = 1) => {
    const nextId = !unref(latestSelectedId) ? getFirstResourceId() : getNextResourceId(up, moveBy)
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

  const getNextResourceId = (previous = false, movedBy = 1) => {
    const latestSelectedResourceIndex = paginatedResources.value.findIndex(
      (resource) => resource.id === latestSelectedId.value
    )
    if (latestSelectedResourceIndex === -1) {
      return -1
    }
    const nextResourceIndex = latestSelectedResourceIndex + (previous ? -movedBy : movedBy)
    if (nextResourceIndex < 0 || nextResourceIndex >= paginatedResources.value.length) {
      return -1
    }
    return paginatedResources.value[nextResourceIndex].id
  }

  const getFirstResourceId = () => {
    return paginatedResources.value.length ? paginatedResources.value[0].id : -1
  }

  const getElementsInRow = () => {
    const tilesListCard = document.querySelectorAll('#tiles-view > ul > li > div')
    if (tilesListCard.length === 0) {
      return -1
    }
    const firstElement = Math.floor(tilesListCard[0].getBoundingClientRect().x)
    let elementsInRow = 1

    for (let i = 1; i < tilesListCard.length; i++) {
      if (Math.floor(tilesListCard[i].getBoundingClientRect().x) !== firstElement) {
        elementsInRow++
      } else {
        break
      }
    }
    return elementsInRow
  }

  const handleSelectAllAction = () => {
    keyActions.resetSelectionCursor()
    store.commit('Files/SET_FILE_SELECTION', paginatedResources.value)
  }

  const handleShiftUpAction = async (movedBy = 1) => {
    const nextResourceId = getNextResourceId(true, movedBy)
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
  const handleShiftDownAction = (movedBy) => {
    const nextResourceId = getNextResourceId(false, movedBy)
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

  watchEffect(() => {
    bindKeyActionsIds.value.forEach((id) => keyActions.removeKeyAction(id))
    bindKeyActionsIds.value = []
    ViewModeConstants.tilesView.name === viewMode.value
      ? bindTilesViewKeyActions()
      : bindTableViewKeyActions()
  })
}
