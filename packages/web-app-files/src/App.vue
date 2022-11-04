<template>
  <main id="files" class="oc-flex oc-height-1-1">
    <div v-if="dragareaEnabled" class="dragarea" />
    <router-view tabindex="0" class="oc-width-expand" />
  </main>
</template>
<script lang="ts">
import { defineComponent, onBeforeUnmount, watch, ref } from 'vue'
import { useRoute, useStore } from 'web-pkg/src/composables'
import { eventBus } from 'web-pkg/src/services/eventBus'
import { mapActions } from 'vuex'

export default defineComponent({
  setup() {
    const store = useStore<any>()
    const dragareaEnabled = ref(false)
    watch(useRoute(), () => {
      store.dispatch('Files/resetFileSelection')
    })

    const hideDropzone = () => {
      dragareaEnabled.value = false
    }
    const onDragOver = (event) => {
      dragareaEnabled.value = (event.dataTransfer.types || []).some((e) => e === 'Files')
    }

    const dragOver = eventBus.subscribe('drag-over', onDragOver)
    const dragOut = eventBus.subscribe('drag-out', hideDropzone)
    const drop = eventBus.subscribe('drop', hideDropzone)

    onBeforeUnmount(() => {
      eventBus.unsubscribe('drag-over', dragOver)
      eventBus.unsubscribe('drag-out', dragOut)
      eventBus.unsubscribe('drop', drop)
    })
    return { dragareaEnabled }
  },

  computed: {
    otgStyle() {
      return {
        'background-color': 'var(--oc-color-swatch-warning-default) !important'
      }
    }
  },

  async mounted() {
    const accessToken = this.$store.getters['runtime/auth/accessToken']

    const headers = new Headers()
    headers.append('Authorization', 'Bearer ' + accessToken)
    headers.append('X-Requested-With', 'XMLHttpRequest')
    const response = await fetch('otg', {
      method: 'GET',
      headers
    })
    if (response.status === 200) {
      const data = await response.json()
      if (data.message)
        this.showMessage({
          title: 'OTG',
          desc: data.message,
          timeout: 10,
          status: 'warning',
          style: this.otgStyle
        })
    }
  },

  methods: {
    ...mapActions(['showMessage']),
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
