<template>
  <main id="files" class="oc-flex oc-height-1-1">
    <div v-if="dragareaEnabled" class="dragarea" />
    <router-view tabindex="0" class="oc-width-expand" />
  </main>
</template>
<script lang="ts">
import { defineComponent, watch } from '@vue/composition-api'
import { useRoute, useStore } from 'web-pkg/src/composables'
import { eventBus } from 'web-pkg/src/services/eventBus'

export default defineComponent({
  setup() {
    const store = useStore<any>()
    watch(useRoute(), () => {
      store.dispatch('Files/resetFileSelection')
    })
  },
  data: () => ({
    dragareaEnabled: false
  }),
  created() {
    const dragOver = eventBus.subscribe('drag-over', this.onDragOver)
    const dragOut = eventBus.subscribe('drag-out', this.hideDropzone)
    const drop = eventBus.subscribe('drop', this.hideDropzone)

    this.$on('beforeDestroy', () => {
      eventBus.unsubscribe('drag-over', dragOver)
      eventBus.unsubscribe('drag-out', dragOut)
      eventBus.unsubscribe('drop', drop)
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

#files {
  position: relative;
}
</style>
