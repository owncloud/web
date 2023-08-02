import { onBeforeUnmount, onMounted, unref, Ref } from 'vue'
import { eventBus } from 'web-pkg'
import { KeyboardActions } from 'web-pkg/src/composables/keyboardActions'
import { findIndex, find } from 'lodash-es'
import { Resource } from 'web-client'

export const useKeyboardTableMouseActions = (
  keyActions: KeyboardActions,
  paginatedResources: Ref<Resource[]>,
  selectedRows: any,
  lastSelectedRowIndex: Ref<number>,
  lastSelectedRowId: Ref<string | null>
) => {
  let fileListClickedShiftEvent

  const handleShiftClickAction = ({ resource, skipTargetSelection }) => {
    const parent = document.querySelectorAll(`[data-item-id='${resource.id}']`)[0]
    const resourceNodes = Object.values(parent.parentNode.children)
    const latestNode = resourceNodes.find(
      (r) => r.getAttribute('data-item-id') === unref(lastSelectedRowId)
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
      const selectedRowIndex = findIndex(selectedRows, { id: nodeId })
      if (selectedRowIndex === -1) {
        const selectedRow = find(paginatedResources.value, { id: nodeId })
        selectedRows.push(selectedRow)
      }
    }

    lastSelectedRowIndex.value = findIndex(paginatedResources.value, { id: resource.id })
    lastSelectedRowId.value = String(resource.id)
    keyActions.resetSelectionCursor()
  }

  onMounted(() => {
    fileListClickedShiftEvent = eventBus.subscribe(
      'app.files.list.clicked.shift',
      handleShiftClickAction
    )
  })

  onBeforeUnmount(() => {
    eventBus.unsubscribe('app.files.list.clicked.shift', fileListClickedShiftEvent)
  })
}
