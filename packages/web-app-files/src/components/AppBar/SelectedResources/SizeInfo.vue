<template>
  <div class="oc-flex oc-flex-middle oc-text-nowrap size-info">
    <translate
      v-if="selectedResourcesSize !== '?'"
      key="multiple-select-info-with-size"
      :translate-n="selectedResourcesCount"
      :translate-params="{ amount: selectedResourcesCount, size: selectedResourcesSize }"
      translate-plural="%{ amount } selected - %{ size }"
      translate-comment="Number of selected resources and their size displayed above the files list"
      >%{ amount } selected - %{ size }
    </translate>
    <translate
      v-else
      key="multiple-select-info"
      :translate-n="selectedResourcesCount"
      :translate-params="{ amount: selectedResourcesCount }"
      translate-plural="%{ amount } selected"
      translate-comment="Number of selected resources displayed above the files list"
      >%{ amount } selected
    </translate>
    <oc-button
      id="files-clear-selection"
      v-oc-tooltip="clearSelectionLabel"
      :aria-label="clearSelectionLabel"
      class="oc-ml-m"
      appearance="outline"
      @click="RESET_SELECTION"
    >
      <oc-icon name="close" />
    </oc-button>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'

import { formatFileSize } from 'web-pkg/src/helpers'

export default {
  computed: {
    ...mapGetters('Files', ['selectedFiles']),

    selectedResourcesCount() {
      return this.selectedFiles.length
    },

    selectedResourcesSize() {
      const totalSize = this.selectedFiles.reduce((totalSize, file) => {
        const size = typeof file.size === 'string' ? parseInt(file.size) : file.size
        return totalSize + size
      }, 0)
      return formatFileSize(totalSize, this.$language.current)
    },

    clearSelectionLabel() {
      return this.$gettext('Clear selection')
    }
  },

  methods: {
    ...mapMutations('Files', ['RESET_SELECTION'])
  }
}
</script>
<style lang="scss">
.size-info span {
  color: var(--oc-color-swatch-passive-default);
}
</style>
