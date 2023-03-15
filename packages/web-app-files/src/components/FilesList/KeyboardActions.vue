<template>
  <div></div>
</template>

<script lang="ts">
import keycode from 'keycode'
import { eventBus } from 'web-pkg/src/services/eventBus'
import { defineComponent, onBeforeUnmount, onMounted, PropType, computed, ref, unref } from 'vue'
import { Resource, SpaceResource } from 'web-client/src/helpers'
import { useScrollTo } from 'web-app-files/src/composables/scrollTo'
import { useClientService, useLoadingService, useStore } from 'web-pkg'
import { useGettext } from 'vue3-gettext'

export default defineComponent({
  props: {
    paginatedResources: {
      type: Array as PropType<Resource[]>,
      required: true
    },
    keybindOnElementId: {
      type: String,
      required: false,
      default: 'files-view'
    },
    space: {
      type: Object as PropType<SpaceResource>,
      required: true
    }
  },
  setup(props) {
    const store = useStore()
    const language = useGettext()
    const clientService = useClientService()
    const { scrollToResource } = useScrollTo()
    const loadingService = useLoadingService()

    const selectionCursor = ref(0)
    let fileListClickedEvent
    let fileListClickedMetaEvent
    let fileListClickedShiftEvent

    const latestSelectedId = computed(() => {
      return store.state.Files.latestSelectedId
    })

    const areCustomKeyBindingsEnabled = () => {
      const activeElementTag = document.activeElement.tagName
      const type = document.activeElement.getAttribute('type')
      if (
        ['textarea', 'input', 'select'].includes(activeElementTag.toLowerCase()) &&
        type !== 'checkbox'
      ) {
        return true
      }
      const closestSelectionEl = window.getSelection().focusNode as HTMLElement
      if (!closestSelectionEl) {
        return false
      }
      let customKeyBindings
      try {
        customKeyBindings = closestSelectionEl?.closest("[data-custom-key-bindings='true']")
      } catch {
        customKeyBindings = closestSelectionEl?.parentElement.closest(
          "[data-custom-key-bindings='true']"
        )
      }
      if (customKeyBindings) {
        return true
      }
      return false
    }
    const resetSelectionCursor = () => {
      selectionCursor.value = 0
    }
    const getNextResourceId = (previous = false) => {
      const latestSelectedResourceIndex = props.paginatedResources.findIndex(
        (resource) => resource.id === latestSelectedId.value
      )
      if (latestSelectedResourceIndex === -1) {
        return -1
      }
      const nextResourceIndex = latestSelectedResourceIndex + (previous ? -1 : 1)
      if (nextResourceIndex < 0 || nextResourceIndex >= props.paginatedResources.length) {
        return -1
      }
      return props.paginatedResources[nextResourceIndex].id
    }
    const getFirstResourceId = () => {
      return props.paginatedResources.length ? props.paginatedResources[0].id : -1
    }

    const handleSpaceAction = (event) => {
      event.preventDefault()
      store.dispatch('Files/toggleFileSelection', { id: unref(latestSelectedId) })
    }
    const handlePasteAction = () => {
      store.dispatch('Files/pasteSelectedFiles', {
        targetSpace: props.space,
        clientService: clientService,
        loadingService: loadingService,
        createModal: (modal) => {
          store.dispatch('createModal', modal)
        },
        hideModal: (modal) => {
          store.dispatch('hideModal', modal)
        },
        showMessage: (msg) => {
          store.dispatch('showMessage', msg)
        },
        $gettext: language.$gettext,
        $gettextInterpolate: language.interpolate,
        $ngettext: language.$ngettext
      })
    }
    const handleNavigateAction = (event, up = false) => {
      event.preventDefault()
      const nextId = !unref(latestSelectedId) ? getFirstResourceId() : getNextResourceId(up)
      if (nextId === -1) {
        return
      }
      resetSelectionCursor()
      store.dispatch('Files/resetFileSelection')
      store.commit('Files/ADD_FILE_SELECTION', { id: nextId })
      scrollToResource({ id: nextId } as any)
    }
    const handleCtrlClickAction = (resource) => {
      store.dispatch('Files/toggleFileSelection', { id: resource.id })
    }
    const handleEscapeAction = () => {
      resetSelectionCursor()
      store.dispatch('Files/resetFileSelection')
    }
    const handleSelectAllAction = (event) => {
      event.preventDefault()
      resetSelectionCursor()
      store.commit('Files/SET_FILE_SELECTION', props.paginatedResources)
    }
    const handleShiftUpAction = () => {
      const nextResourceId = getNextResourceId(true)
      if (nextResourceId === -1) {
        return
      }
      if (unref(selectionCursor) > 0) {
        // deselect
        store.dispatch('Files/toggleFileSelection', { id: unref(latestSelectedId) })
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
    const handleShiftClickAction = (resource) => {
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
        store.commit('Files/ADD_FILE_SELECTION', { id: nodeId })
      }
      store.commit('Files/SET_LATEST_SELECTED_FILE_ID', resource.id)
    }

    const handelLocalShortcuts = (event) => {
      const key = event.keyCode || event.which
      if (key === keycode('space')) {
        return handleSpaceAction(event)
      }
    }
    const handleGlobalShortcuts = (event) => {
      const key = event.keyCode || event.which
      const shift = event.shiftKey
      const ctrl = window.navigator.platform.match('Mac') ? event.metaKey : event.ctrlKey
      const isTextSelected = window.getSelection().type === 'Range'

      if (areCustomKeyBindingsEnabled()) {
        return
      }
      if (isTextSelected) {
        return
      }

      if (key === keycode('c') && ctrl) {
        return store.dispatch('Files/copySelectedFiles', {
          ...language,
          space: props.space,
          resources: store.getters['Files/selectedFiles']
        })
      }
      if (key === keycode('v') && ctrl) {
        return handlePasteAction()
      }
      if (key === keycode('x') && ctrl) {
        return store.dispatch('Files/cutSelectedFiles', {
          ...language,
          space: props.space,
          resources: store.getters['Files/selectedFiles']
        })
      }
      if (key === keycode('down') && !shift) {
        return handleNavigateAction(event)
      }
      if (key === keycode('up') && !shift) {
        return handleNavigateAction(event, true)
      }

      if (key === keycode('esc')) {
        return handleEscapeAction()
      }
      if (key === keycode('down') && shift) {
        return handleShiftDownAction()
      }
      if (key === keycode('up') && shift) {
        return handleShiftUpAction()
      }
      if (key === keycode('a') && ctrl) {
        return handleSelectAllAction(event)
      }
    }

    onMounted(() => {
      const element = document.getElementById(props.keybindOnElementId)
      if (element) {
        element.addEventListener('keydown', handelLocalShortcuts, false)
      }
      document.addEventListener('keydown', handleGlobalShortcuts)

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
      const element = document.getElementById(props.keybindOnElementId)
      if (element) {
        element.removeEventListener('keydown', handelLocalShortcuts)
      }
      document.removeEventListener('keydown', handleGlobalShortcuts)
    })

    return {
      areCustomKeyBindingsEnabled,
      handleGlobalShortcuts,
      handelLocalShortcuts,
      handleShiftClickAction,
      handleCtrlClickAction
    }
  }
})
</script>
