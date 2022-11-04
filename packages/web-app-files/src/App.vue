<template>
  <main id="files" class="oc-flex oc-height-1-1">
    <div v-if="dragareaEnabled" class="dragarea" />
    <router-view tabindex="0" class="oc-width-expand" />
  </main>
</template>
<script lang="ts">
import { defineComponent, watch } from '@vue/composition-api'
import { Route } from 'vue-router'
import { useRoute, useStore } from 'web-pkg/src/composables'
import { bus } from 'web-pkg/src/instance'
import { mapActions } from 'vuex'

export default defineComponent({
  setup() {
    const store = useStore<any>()
    watch(useRoute(), (to: Route, from?: Route) => {
      store.dispatch('Files/resetFileSelection')
    })
  },
  data: () => ({
    dragareaEnabled: false
  }),
  computed: {
    otgStyle() {
      return {
        'background-color': 'var(--oc-color-swatch-warning-default) !important'
      }
    }
  },
  created() {
    const dragOver = bus.subscribe('drag-over', this.onDragOver)
    const dragOut = bus.subscribe('drag-out', this.hideDropzone)
    const drop = bus.subscribe('drop', this.hideDropzone)

    this.$on('beforeDestroy', () => {
      bus.unsubscribe('drag-over', dragOver)
      bus.unsubscribe('drag-out', dragOut)
      bus.unsubscribe('drop', drop)
    })
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
