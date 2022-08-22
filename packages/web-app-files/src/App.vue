<template>
  <main id="files" class="oc-flex oc-height-1-1">
    <div v-if="dragareaEnabled" class="dragarea" />
    <div ref="filesListWrapper" tabindex="-1" class="files-list-wrapper oc-width-expand">
      <router-view id="files-view" tabindex="0" />
    </div>
  </main>
</template>
<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import { bus } from 'web-pkg/src/instance'

export default defineComponent({
  data: () => ({
    dragareaEnabled: false
  }),
  created() {
    this.$root.$on('upload-end', () => {
      // delay for screen reader virtual buffer
      setTimeout(() => this.$refs.filesListWrapper.focus(), 500)
    })
    const dragOver = bus.subscribe('drag-over', this.onDragOver)
    const dragOut = bus.subscribe('drag-out', this.hideDropzone)
    const drop = bus.subscribe('drop', this.hideDropzone)

    this.$on('beforeDestroy', () => {
      bus.unsubscribe('drag-over', dragOver)
      bus.unsubscribe('drag-out', dragOut)
      bus.unsubscribe('drop', drop)
    })
  },

  methods: {
    hideDropzone() {
      this.dragareaEnabled = false
    },
    onDragOver(event) {
      this.dragareaEnabled = (event.dataTransfer.types || []).some((e) => e === 'Files')
    }
  }
})
</script>

<style lang="scss" scoped>
main {
  max-height: 100%;
}

.dragarea {
  background-color: rgba(60, 130, 225, 0.21);
  pointer-events: none;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
  z-index: 9;
  border-radius: 14px;
  border: 2px dashed var(--oc-color-swatch-primary-muted);
}
.files-list-wrapper {
  position: relative;
  overflow-y: auto;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: max-content max-content 1fr;
  gap: 0 0;
  grid-template-areas:
    'header'
    'upload'
    'main';

  &:focus {
    outline: none;
  }
}

#files {
  position: relative;
}

#files-view {
  grid-area: main;
  z-index: 0;
  outline: none;
}
</style>
