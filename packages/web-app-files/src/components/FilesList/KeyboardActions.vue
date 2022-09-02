<template>
  <div></div>
</template>

<script lang="ts">
import { bus } from 'web-pkg/src/instance'
import { mapActions, mapState, mapMutations } from 'vuex'
import { defineComponent } from '@vue/composition-api'
import MixinFilesListScrolling from '../../mixins/filesListScrolling'
import { usePublicLinkContext, usePublicLinkPassword, useStore } from 'web-pkg/src/composables'

export default defineComponent({
  mixins: [MixinFilesListScrolling],
  props: {
    paginatedResources: {
      type: Array,
      required: true
    },
    keybindOnElementIds: {
      type: Array,
      required: false,
      default: () => ['files-view', 'web-nav-sidebar']
    }
  },
  setup() {
    const store = useStore()
    return {
      publicLinkPassword: usePublicLinkPassword({ store }),
      isPublicLinkContext: usePublicLinkContext({ store })
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
    for (const elementId of this.keybindOnElementIds) {
      const element = document.getElementById(elementId)
      if (element) {
        element.addEventListener('keydown', this.handleSelectionShortcuts, false)
      }
    }
    document.addEventListener('keydown', this.handleClipboardShortcuts)

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
      for (const elementId of this.keybindOnElementIds) {
        const element = document.getElementById(elementId)
        if (element) {
          element.removeEventListener('keydown', this.handleSelectionShortcuts)
        }
      }
      document.removeEventListener('keydown', this.handleClipboardShortcuts)
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

    handleSelectionShortcuts(event) {
      const key = event.keyCode || event.which
      const ctrl = window.navigator.platform.match('Mac') ? event.metaKey : event.ctrlKey
      const shift = event.shiftKey

      this.handleFileSelectionShortcuts(key, shift, ctrl, event)
    },

    handleClipboardShortcuts(event) {
      const key = event.keyCode || event.which
      const shift = event.shiftKey
      const ctrl = window.navigator.platform.match('Mac') ? event.metaKey : event.ctrlKey
      const isCopyAction = key === 67
      const isPasteAction = key === 86
      const isCutAction = key === 88
      const isUpPressed = key === 38
      const isDownPressed = key === 40
      const isTextSelected = window.getSelection().type === 'Range'
 
      const customKeyBindings = (window.getSelection().focusNode as HTMLElement)?.closest("[data-custom-key-bindings='true']")
      if(customKeyBindings) return

      if (isTextSelected) return
      if (isCopyAction && ctrl) return this.copySelectedFiles()
      if (isPasteAction && ctrl) return this.handlePasteAction()
      if (isCutAction && ctrl) return this.cutSelectedFiles()
      if (isDownPressed && !shift) return this.handleNavigateAction(event)
      if (isUpPressed && !shift) return this.handleNavigateAction(event, true)
    },

    handleFileSelectionShortcuts(key, shift, ctrl, event) {
      const isUpPressed = key === 38
      const isDownPressed = key === 40
      const isEscapePressed = key === 27
      const isSpacePressed = key === 32
      const isAPressed = key === 65

      

      /*if (isDownPressed && !shift) return this.handleNavigateAction(event)
      if (isUpPressed && !shift) return this.handleNavigateAction(event, true)*/
      if (isSpacePressed) return this.handleSpaceAction(event)
      if (isEscapePressed) return this.handleEscapeAction()
      if (isDownPressed && shift) return this.handleShiftDownAction(event)
      if (isUpPressed && shift) return this.handleShiftUpAction(event)
      if (isAPressed && ctrl) return this.handleSelectAllAction(event)
    },

    handleNavigateAction(event, up = false) {
      event.preventDefault()
      let nextId
      if (!this.latestSelectedId) {
        nextId = this.getFirstResourceId()
      } else {
        nextId = this.getNextResourceId(up)
      }
      if (nextId === -1) return
      this.resetSelectionCursor()
      this.resetFileSelection()
      this.addFileSelection({ id: nextId })
      this.scrollToResource({ id: nextId })
      document.getElementById(this.keybindOnElementIds[0]).focus()
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
      if (nextResourceId === -1) return
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
      if (nextResourceId === -1) return
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
        client: this.$client,
        createModal: this.createModal,
        hideModal: this.hideModal,
        showMessage: this.showMessage,
        $gettext: this.$gettext,
        $gettextInterpolate: this.$gettextInterpolate,
        $ngettext: this.$ngettext,
        isPublicLinkContext: this.isPublicLinkContext,
        publicLinkPassword: this.publicLinkPassword,
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
      const nextRow = (
        previous ? latestSelectedRow.previousSibling : latestSelectedRow.nextSibling
      ) as HTMLElement
      if (nextRow === null) return -1
      return nextRow.getAttribute('data-item-id')
    },

    getFirstResourceId() {
      const firstRow = document.getElementsByClassName('oc-tbody-tr')[0]
      return firstRow.getAttribute('data-item-id')
    }
  }
})
</script>
