import { computed, onBeforeUnmount, onMounted, ref, unref } from 'vue'
import { useStore } from 'web-pkg/src/composables'
import { useScrollTo } from 'web-app-files/src/composables/scrollTo'
import { Key, ModifierKey } from 'web-pkg/src/composables/keyboardActions'
import { eventBus } from 'web-pkg'
import { useGettext } from 'vue3-gettext'

export const useKeyboardActionsSearchTable = (keyActions, paginatedResources) => {
  const store = useStore()
  const { scrollToResource } = useScrollTo()
  const selectionCursor = ref(0)
  const latestSelectedId = computed(() => store.state.Files.latestSelectedId)
  const language = useGettext()

  let fileListClickedEvent
  let fileListClickedMetaEvent
  let fileListClickedShiftEvent

  keyActions.bindKeyAction(null, Key.ArrowUp, () => handleNavigateAction(true))

  keyActions.bindKeyAction(null, Key.ArrowDown, () => handleNavigateAction())

  keyActions.bindKeyAction(null, Key.Esc, () => {
    resetSelectionCursor()
    store.dispatch('Files/resetFileSelection')
  })

  keyActions.bindKeyAction(null, Key.Space, () => {
    store.dispatch('Files/toggleFileSelection', { id: unref(latestSelectedId) })
  })

  keyActions.bindKeyAction(ModifierKey.Shift, Key.ArrowUp, () => handleShiftUpAction())

  keyActions.bindKeyAction(ModifierKey.Shift, Key.ArrowDown, () => handleShiftDownAction())

  keyActions.bindKeyAction(ModifierKey.Ctrl, Key.A, () => handleSelectAllAction())

  keyActions.bindKeyAction(ModifierKey.Ctrl, Key.C, () => {
    store.dispatch('Files/copySelectedFiles', {
      ...language,
      resources: store.getters['Files/selectedFiles']
    })
  })

  const handleNavigateAction = async (up = false) => {
    const nextId = !unref(latestSelectedId) ? getFirstResourceId() : getNextResourceId(up)
    if (nextId === -1) {
      return
    }
    resetSelectionCursor()
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

  const resetSelectionCursor = () => {
    selectionCursor.value = 0
  }

  const handleSelectAllAction = () => {
    resetSelectionCursor()
    store.commit('Files/SET_FILE_SELECTION', paginatedResources.value)
  }

  const handleShiftUpAction = async () => {
    const nextResourceId = getNextResourceId(true)
    if (nextResourceId === -1) {
      return
    }
    if (unref(selectionCursor) > 0) {
      // deselect
      await store.dispatch('Files/toggleFileSelection', { id: unref(latestSelectedId) })
      store.commit('Files/SET_LATEST_SELECTED_FILE_ID', nextResourceId)
    } else {
      // select
      store.commit('Files/ADD_FILE_SELECTION', { id: nextResourceId })
    }
    scrollToResource({ id: nextResourceId } as any)
    selectionCursor.value = unref(selectionCursor) - 1
  }
  const handleShiftDownAction = () => {
    const nextResourceId = getNextResourceId()
    if (nextResourceId === -1) {
      return
    }
    if (unref(selectionCursor) < 0) {
      // deselect
      store.dispatch('Files/toggleFileSelection', { id: unref(latestSelectedId) })
      store.commit('Files/SET_LATEST_SELECTED_FILE_ID', nextResourceId)
    } else {
      // select
      store.commit('Files/ADD_FILE_SELECTION', { id: nextResourceId })
    }
    scrollToResource({ id: nextResourceId } as any)
    selectionCursor.value = unref(selectionCursor) + 1
  }

  const handleCtrlClickAction = async (resource) => {
    await store.dispatch('Files/toggleFileSelection', { id: resource.id })
  }

  const handleShiftClickAction = ({ resource, skipTargetSelection }) => {
    const parent = document.querySelectorAll(`[data-item-id='${resource.id}']`)[0]
    const resourceNodes = Object.values(parent.parentNode.children)
    const latestNode = resourceNodes.find(
      (r) => r.getAttribute('data-item-id') === unref(latestSelectedId)
    )
    const clickedNode = resourceNodes.find((r) => r.getAttribute('data-item-id') === resource.id)

    let latestNodeIndex = resourceNodes.indexOf(latestNode)
    latestNodeIndex = latestNodeIndex === -1 ? 0 : latestNodeIndex

    const clickedNodeIndex = resourceNodes.indexOf(clickedNode)
    const minIndex = Math.min(latestNodeIndex, clickedNodeIndex)
    const maxIndex = Math.max(latestNodeIndex, clickedNodeIndex)

    for (let i = minIndex; i <= maxIndex; i++) {
      const nodeId = resourceNodes[i].getAttribute('data-item-id')
      if (skipTargetSelection && nodeId === resource.id) {
        continue
      }
      store.commit('Files/ADD_FILE_SELECTION', { id: nodeId })
    }
    store.commit('Files/SET_LATEST_SELECTED_FILE_ID', resource.id)
  }

  onMounted(() => {
    fileListClickedEvent = eventBus.subscribe('app.files.list.clicked', resetSelectionCursor)
    fileListClickedMetaEvent = eventBus.subscribe(
      'app.files.list.clicked.meta',
      handleCtrlClickAction
    )
    fileListClickedShiftEvent = eventBus.subscribe(
      'app.files.list.clicked.shift',
      handleShiftClickAction
    )
  })

  onBeforeUnmount(() => {
    eventBus.unsubscribe('app.files.list.clicked', fileListClickedEvent)
    eventBus.unsubscribe('app.files.list.clicked.meta', fileListClickedMetaEvent)
    eventBus.unsubscribe('app.files.list.clicked.shift', fileListClickedShiftEvent)
  })
}
