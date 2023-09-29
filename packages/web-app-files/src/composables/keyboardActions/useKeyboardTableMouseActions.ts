import { onBeforeUnmount, onMounted, unref, computed, Ref, watchEffect } from 'vue'
import { QueryValue, useStore, ViewModeConstants } from '@ownclouders/web-pkg'
import { eventBus } from '@ownclouders/web-pkg'
import { KeyboardActions } from '@ownclouders/web-pkg'
import { Resource } from '@ownclouders/web-client'
import { findIndex } from 'lodash-es'

export const useKeyboardTableMouseActions = (
  keyActions: KeyboardActions,
  viewMode: Ref<string | QueryValue>
) => {
  const store = useStore()
  const latestSelectedId = computed(() => store.state.Files.latestSelectedId)

  let fileListClickedEvent
  let fileListClickedMetaEvent
  let fileListClickedShiftEvent

  const handleCtrlClickAction = (resource: Resource) => {
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
      const isDisabled = resourceNodes[i].classList.contains('oc-table-disabled')
      if ((skipTargetSelection && nodeId === resource.id) || isDisabled) {
        continue
      }
      store.commit('Files/ADD_FILE_SELECTION', { id: nodeId })
    }
    store.commit('Files/SET_LATEST_SELECTED_FILE_ID', resource.id)
  }

  const handleTilesShiftClickAction = ({ resource, skipTargetSelection }) => {
    const tilesListCard = document.querySelectorAll('#tiles-view > ul > li > div')
    const startIndex = findIndex(
      tilesListCard,
      (r) => r.getAttribute('data-item-id') === resource.id
    )
    const endIndex = findIndex(
      tilesListCard,
      (r) => r.getAttribute('data-item-id') === unref(latestSelectedId)
    )
    const minIndex = Math.min(endIndex, startIndex)
    const maxIndex = Math.max(endIndex, startIndex)

    for (let i = minIndex; i <= maxIndex; i++) {
      const nodeId = tilesListCard[i].getAttribute('data-item-id')
      const isDisabled = tilesListCard[i].classList.contains('oc-tile-card-disabled')

      if ((skipTargetSelection && nodeId === resource.id) || isDisabled) {
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
  })

  onBeforeUnmount(() => {
    eventBus.unsubscribe('app.files.list.clicked', fileListClickedEvent)
    eventBus.unsubscribe('app.files.list.clicked.meta', fileListClickedMetaEvent)
    eventBus.unsubscribe('app.files.list.clicked.shift', fileListClickedShiftEvent)
  })
  watchEffect(() => {
    eventBus.unsubscribe('app.files.list.clicked.shift', fileListClickedShiftEvent)
    fileListClickedShiftEvent = eventBus.subscribe(
      'app.files.list.clicked.shift',
      ViewModeConstants.tilesView.name === viewMode.value
        ? handleTilesShiftClickAction
        : handleShiftClickAction
    )
  })
}
