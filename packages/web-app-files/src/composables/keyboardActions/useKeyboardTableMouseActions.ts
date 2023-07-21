import { onBeforeUnmount, onMounted, unref, computed } from 'vue'
import { eventBus, useStore } from 'web-pkg'

export const useKeyboardTableMouseActions = (keyActions) => {
  const store = useStore()
  const latestSelectedId = computed(() => store.state.Files.latestSelectedId)

  let fileListClickedEvent
  let fileListClickedMetaEvent
  let fileListClickedShiftEvent

  const handleCtrlClickAction = (resource) => {
    store.dispatch('Files/toggleFileSelection', { id: resource.id })
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
    fileListClickedEvent = eventBus.subscribe(
      'app.files.list.clicked',
      keyActions.resetSelectionCursor
    )
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
