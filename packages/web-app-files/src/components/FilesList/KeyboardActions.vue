<template>
  <div></div>
</template>

<script lang="ts">
import keycode from 'keycode'
import { bus } from 'web-pkg/src/instance'
import { mapActions, mapState, mapMutations } from 'vuex'
import { defineComponent, PropType } from '@vue/composition-api'
import MixinFilesListScrolling from '../../mixins/filesListScrolling'
import { SpaceResource } from 'web-client/src/helpers'

export default defineComponent({
  mixins: [MixinFilesListScrolling],
  props: {
    paginatedResources: {
      type: Array,
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
  data: () => {
    return {
      selectionCursor: 0
    }
  },

  computed: {
    ...mapState('Files', ['latestSelectedId'])
  },

  mounted() {
    const element = document.getElementById(this.keybindOnElementId)
    if (element) {
      element.addEventListener('keydown', this.handelLocalShortcuts, false)
    }
    document.addEventListener('keydown', this.handleGlobalShortcuts)

    const fileListClickedEvent = bus.subscribe('app.files.list.clicked', this.resetSelectionCursor)
    const fileListClickedMetaEvent = bus.subscribe(
      'app.files.list.clicked.meta',
      this.handleCtrlClickAction
    )
    const fileListClickedShiftEvent = bus.subscribe(
      'app.files.list.clicked.shift',
      this.handleShiftClickAction
    )

    this.$on('beforeDestroy', () => {
      bus.unsubscribe('app.files.list.clicked', fileListClickedEvent)
      bus.unsubscribe('app.files.list.clicked.meta', fileListClickedMetaEvent)
      bus.unsubscribe('app.files.list.clicked.shift', fileListClickedShiftEvent)
      const element = document.getElementById(this.keybindOnElementId)
      if (element) {
        element.removeEventListener('keydown', this.handelLocalShortcuts)
      }
      document.removeEventListener('keydown', this.handleGlobalShortcuts)
    })
  },

  methods: {
    ...mapActions(['showMessage', 'createModal', 'hideModal']),
    ...mapActions('Files', [
      'copySelectedFiles',
      'cutSelectedFiles',
      'pasteSelectedFiles',
      'resetFileSelection',
      'toggleFileSelection'
    ]),
    ...mapMutations('Files', {
      upsertResource: 'UPSERT_RESOURCE',
      setLatestSelectedFile: 'SET_LATEST_SELECTED_FILE_ID',
      setFileSelection: 'SET_FILE_SELECTION',
      addFileSelection: 'ADD_FILE_SELECTION'
    }),

    areCustomKeyBindingsEnabled() {
      const activeElementTag = document.activeElement.tagName
      const type = document.activeElement.getAttribute('type')
      if (['textarea', 'input', 'select'].includes(activeElementTag.toLowerCase()) && type !== 'checkbox') {
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
    },

    handelLocalShortcuts(event) {
      const key = event.keyCode || event.which
      if (key === keycode('space')) {
        return this.handleSpaceAction(event)
      }
    },

    handleGlobalShortcuts(event) {
      const key = event.keyCode || event.which
      const shift = event.shiftKey
      const ctrl = window.navigator.platform.match('Mac') ? event.metaKey : event.ctrlKey
      const isTextSelected = window.getSelection().type === 'Range'

      if (this.areCustomKeyBindingsEnabled()) {
        return
      }
      if (isTextSelected) {
        return
      }

      if (key === keycode('c') && ctrl) {
        return this.copySelectedFiles({ space: this.space })
      }
      if (key === keycode('v') && ctrl) {
        return this.handlePasteAction()
      }
      if (key === keycode('x') && ctrl) {
        return this.cutSelectedFiles({ space: this.space })
      }
      if (key === keycode('down') && !shift) {
        return this.handleNavigateAction(event)
      }
      if (key === keycode('up') && !shift) {
        return this.handleNavigateAction(event, true)
      }

      if (key === keycode('esc')) {
        return this.handleEscapeAction()
      }
      if (key === keycode('down') && shift) {
        return this.handleShiftDownAction(event)
      }
      if (key === keycode('up') && shift) {
        return this.handleShiftUpAction(event)
      }
      if (key === keycode('a') && ctrl) {
        return this.handleSelectAllAction(event)
      }
    },

    handleNavigateAction(event, up = false) {
      event.preventDefault()
      let nextId
      if (!this.latestSelectedId) {
        nextId = this.getFirstResourceId()
      } else {
        nextId = this.getNextResourceId(up)
      }
      if (nextId === -1) {
        return
      }
      this.resetSelectionCursor()
      this.resetFileSelection()
      this.addFileSelection({ id: nextId })
      this.scrollToResource({ id: nextId })
    },

    handleShiftClickAction(resource) {
      const parent = document.querySelectorAll(`[data-item-id='${resource.id}']`)[0]
      const resourceNodes = Object.values(parent.parentNode.childNodes) as HTMLElement[]
      const latestNode = resourceNodes.find(
        (r) => r.getAttribute('data-item-id') === this.latestSelectedId
      )
      const clickedNode = resourceNodes.find((r) => r.getAttribute('data-item-id') === resource.id)

      let latestNodeIndex = resourceNodes.indexOf(latestNode)
      latestNodeIndex = latestNodeIndex === -1 ? 0 : latestNodeIndex

      const clickedNodeIndex = resourceNodes.indexOf(clickedNode)
      const minIndex = Math.min(latestNodeIndex, clickedNodeIndex)
      const maxIndex = Math.max(latestNodeIndex, clickedNodeIndex)

      for (let i = minIndex; i <= maxIndex; i++) {
        const nodeId = resourceNodes[i].getAttribute('data-item-id')
        this.addFileSelection({ id: nodeId })
      }
      this.setLatestSelectedFile(resource.id)
    },

    handleCtrlClickAction(resource) {
      this.toggleFileSelection({ id: resource.id })
    },

    handleEscapeAction() {
      this.resetSelectionCursor()
      this.resetFileSelection()
    },

    handleSelectAllAction(event) {
      event.preventDefault()
      this.resetSelectionCursor()
      this.setFileSelection(this.paginatedResources)
    },

    handleSpaceAction(event) {
      event.preventDefault()
      this.toggleFileSelection({ id: this.latestSelectedId })
    },

    handleShiftUpAction() {
      const nextResourceId = this.getNextResourceId(true)
      if (nextResourceId === -1) {
        return
      }
      if (this.selectionCursor > 0) {
        // deselect
        this.toggleFileSelection({ id: this.latestSelectedId })
        this.setLatestSelectedFile(nextResourceId)
      } else {
        // select
        this.addFileSelection({ id: nextResourceId })
      }
      this.scrollToResource({ id: nextResourceId })
      this.selectionCursor = this.selectionCursor - 1
    },

    handleShiftDownAction() {
      const nextResourceId = this.getNextResourceId()
      if (nextResourceId === -1) {
        return
      }
      if (this.selectionCursor < 0) {
        // deselect
        this.toggleFileSelection({ id: this.latestSelectedId })
        this.setLatestSelectedFile(nextResourceId)
      } else {
        // select
        this.addFileSelection({ id: nextResourceId })
      }
      this.scrollToResource({ id: nextResourceId })
      this.selectionCursor = this.selectionCursor + 1
    },

    handlePasteAction() {
      this.pasteSelectedFiles({
        targetSpace: this.space,
        clientService: this.$clientService,
        createModal: this.createModal,
        hideModal: this.hideModal,
        showMessage: this.showMessage,
        $gettext: this.$gettext,
        $gettextInterpolate: this.$gettextInterpolate,
        $ngettext: this.$ngettext,
        upsertResource: this.upsertResource
      })
    },

    resetSelectionCursor() {
      this.selectionCursor = 0
    },

    getNextResourceId(previous = false) {
      const latestSelectedRow = document.querySelectorAll(
        `[data-item-id='${this.latestSelectedId}']`
      )[0]
      let nextRow
      try {
        nextRow = (
          previous ? latestSelectedRow.previousSibling : latestSelectedRow.nextSibling
        ) as HTMLElement
      } catch {
        return -1
      }
      if (nextRow === null) {
        return -1
      }
      return nextRow.getAttribute('data-item-id')
    },

    getFirstResourceId() {
      const firstRow = document.getElementsByClassName('oc-tbody-tr')[0]
      if (!firstRow) {
        return -1
      }
      return firstRow.getAttribute('data-item-id')
    }
  }
})
</script>
