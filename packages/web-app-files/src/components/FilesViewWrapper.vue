<template>
  <div class="files-view-wrapper oc-width-expand">
    <div id="files-view" v-bind="$attrs">
      <slot />
    </div>
  </div>

  <portal v-if="showEmbedActions" to="app.runtime.footer">
    <embed-actions />
  </portal>
</template>

<script lang="ts">
import { computed, defineComponent, unref } from 'vue'
import { useEmbedMode } from '@ownclouders/web-pkg'
import EmbedActions from './EmbedActions/EmbedActions.vue'

export default defineComponent({
  components: { EmbedActions },
  inheritAttrs: false,
  setup() {
    const { isEnabled: isEmbedModeEnabled, isFilePicker } = useEmbedMode()
    const showEmbedActions = computed(() => {
      return unref(isEmbedModeEnabled) && !unref(isFilePicker)
    })

    return { showEmbedActions }
  }
})
</script>

<style lang="scss" scoped>
.files-view-wrapper {
  height: 100%;
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

#files-view {
  grid-area: main;
  z-index: 0;
  outline: none;
}
</style>
