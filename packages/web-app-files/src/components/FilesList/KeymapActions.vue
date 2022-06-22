<template>
  <div></div>
</template>

<script lang="ts">
import { bus } from 'web-pkg/src/instance'
import { useResourcesViewDefaults } from '../../composables'
import { Resource } from '../../helpers/resource'
import { mapActions, mapState, mapMutations } from 'vuex'

export default {
  props: {},

  data: () => {
    return {
      selectionCursor: 0
    }
  },

  computed: {
    ...mapState('Files', ['latestSelectedId'])
  },

	setup() {
    return {
      ...useResourcesViewDefaults<Resource, any, any[]>(),
    }
  },

  created() {
    const fileListClickedEvent = bus.subscribe('app.files.list.clicked', () => {
      this.selectionCursor = 0
    })

    this.$on('beforeDestroy', () => {
      bus.unsubscribe('app.files.list.clicked', fileListClickedEvent)
    })
  },

  mounted() {
    document.addEventListener('keydown', this.handleShortcut, false)
  },

  beforeDestroy() {
    document.removeEventListener('keydown', this.handleShortcut)
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
    ...mapMutations('Files', ['UPSERT_RESOURCE', 'SET_LATEST_SELECTED_FILE', 'SET_FILE_SELECTION']),

    handleShortcut(event) {
      const key = event.keyCode || event.which
      const ctrl = window.navigator.platform.match('Mac') ? event.metaKey : event.ctrlKey
      const shift = event.shiftKey

      this.handleFileActionsShortcuts(key, ctrl)
      this.handleFileSelectionShortcuts(key, shift, ctrl, event)
    },

    handleFileActionsShortcuts(key, ctrl) {
      if (!ctrl /* CTRL | CMD */) return
      const isCopyAction = key === 67
      const isPasteAction = key === 86
      const isCutAction = key === 88
      if (isCopyAction) return this.copySelectedFiles()
      if (isPasteAction) return this.handlePasteAction()
      if (isCutAction) return this.cutSelectedFiles()
    },

    handleFileSelectionShortcuts(key, shift, ctrl, event) {
      const isUpPressed = key === 38
      const isDownPressed = key === 40
			const isEscapePressed = key === 27
			const isSpacePressed = key === 32
			const isAPressed = key === 65

			if (isSpacePressed) return this.handleSpaceAction(event)
			if (isEscapePressed) return this.resetFileSelection()
      if (isDownPressed && shift) return this.handleShiftDownAction()
      if (isUpPressed && shift) return this.handleShiftUpAction()
			if (isAPressed && ctrl) return this.handleSelectAllAction(event)
    },

		handleSelectAllAction(event) {
			event.preventDefault()
			this.SET_FILE_SELECTION(this.paginatedResources)
		},

		handleSpaceAction(event) {
			event.preventDefault()
			this.toggleFileSelection({ id: this.latestSelectedId })
		},

    handleShiftUpAction() {
      const latestSelectedRow = document.querySelectorAll(
        `[data-item-id='${this.latestSelectedId}']`
      )[0]
      const nextRow = latestSelectedRow.previousSibling as HTMLElement
      if (nextRow === null) return
      const nextResourceId = nextRow.getAttribute('data-item-id')
      if (this.selectionCursor > 0) {
        // deselect
        this.toggleFileSelection({ id: this.latestSelectedId })
        this.SET_LATEST_SELECTED_FILE(nextResourceId)
      } else {
        // select
        this.toggleFileSelection({ id: nextResourceId })
      }
      this.selectionCursor = this.selectionCursor - 1
    },

    handleShiftDownAction() {
      const latestSelectedRow = document.querySelectorAll(
        `[data-item-id='${this.latestSelectedId}']`
      )[0]
      const nextRow = latestSelectedRow.nextSibling as HTMLElement
      if (nextRow === null) return
      const nextResourceId = nextRow.getAttribute('data-item-id')

      if (this.selectionCursor < 0) {
        // deselect
        this.toggleFileSelection({ id: this.latestSelectedId })
        this.SET_LATEST_SELECTED_FILE(nextResourceId)
      } else {
        // select
        this.toggleFileSelection({ id: nextResourceId })
      }
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
        upsertResource: this.UPSERT_RESOURCE
      })
    }
  }
}
</script>
