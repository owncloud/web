<template>
	<div>
  </div>
</template>

<script lang="ts">
import { bus } from 'web-pkg/src/instance'
import { mapActions, mapState, mapMutations } from 'vuex'

export default {
  props: {
  },

	data: () => {
    return {
      selectionCounter: 0
    }
  },

  computed: {
		...mapState('Files', ['latestSelectedId']),
    items() {
    },
  },

	created() {
    const fileListClickedEvent = bus.subscribe('app.files.list.clicked', () => {
      this.selectionCounter = 0
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
		...mapActions('Files', ['copySelectedFiles', 'cutSelectedFiles', 'pasteSelectedFiles', 'resetFileSelection', 'toggleFileSelection']),
		...mapMutations('Files', ['UPSERT_RESOURCE', 'SET_LATEST_SELECTED_FILE']),

		handleShortcut(event) {
      this.handleFileActionsShortcuts(event)
      this.handleFileSelectionShortcuts(event)
    },

		handleFileSelectionShortcuts(event) {
      // click has to reset selectioncounter
      const key = event.keyCode || event.which
      const isShiftPressed = event.shiftKey
      if(!isShiftPressed) return
      const isUpPressed = key === 38
      const isDownPressed = key === 40
      if(isDownPressed) {
        const latestSelectedRow = document.querySelectorAll(`[data-item-id='${this.latestSelectedId}']`)[0]
        const nextRow = latestSelectedRow.nextSibling as HTMLElement
        if(nextRow === null) return
        const nextResourceId = nextRow.getAttribute("data-item-id")

        if(this.selectionCounter < 0) {
          // deselect
          this.toggleFileSelection({id: this.latestSelectedId})
          this.SET_LATEST_SELECTED_FILE(nextResourceId)
        }else {
          // select
          this.toggleFileSelection({id: nextResourceId})
        }
        this.selectionCounter = this.selectionCounter + 1
      }
      if(isUpPressed) {
        const latestSelectedRow = document.querySelectorAll(`[data-item-id='${this.latestSelectedId}']`)[0]
        const nextRow = latestSelectedRow.previousSibling as HTMLElement
        if(nextRow === null) return
        const nextResourceId = nextRow.getAttribute("data-item-id")
        if(this.selectionCounter > 0) {
          // deselect
          this.toggleFileSelection({id: this.latestSelectedId})
          this.SET_LATEST_SELECTED_FILE(nextResourceId)
        }else {
          // select
          this.toggleFileSelection({id: nextResourceId})
        }
        this.selectionCounter = this.selectionCounter - 1
      }
    },

		handleFileActionsShortcuts(event) {
      const key = event.keyCode || event.which
      const ctr = window.navigator.platform.match('Mac') ? event.metaKey : event.ctrlKey
      if (!ctr /* CTRL | CMD */) return
      const isCopyAction = key === 67
      const isPaseAction = key === 86
      const isCutAction = key === 88
      if (isCopyAction) {
        this.copySelectedFiles()
      } else if (isPaseAction) {
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
      } else if (isCutAction) {
        this.cutSelectedFiles()
      }
    },
	}
}
</script>
