<template>
  <div class="oc-pl-xs oc-flex oc-flex-middle oc-text-nowrap size-info">
    <oc-button
      id="files-clear-selection"
      v-oc-tooltip="clearSelectionLabel"
      :aria-label="clearSelectionLabel"
      class="oc-mr-m"
      appearance="raw"
      @click="RESET_SELECTION"
    >
      <oc-icon name="close" />
    </oc-button>
    <translate
      v-if="selectedResourcesSize !== '?'"
      key="multiple-select-info-with-size"
      :translate-n="selectedResourcesAmount"
      :translate-params="{ amount: selectedResourcesAmount, size: selectedResourcesSize }"
      translate-plural="%{ amount } selected - %{ size }"
      translate-comment="Number of selected resources and their size displayed above the files list"
      >%{ amount } selected - %{ size }
    </translate>
    <translate
      v-else
      key="multiple-select-info"
      :translate-n="selectedResourcesAmount"
      :translate-params="{ amount: selectedResourcesAmount }"
      translate-plural="%{ amount } selected"
      translate-comment="Number of selected resources displayed above the files list"
      >%{ amount } selected
    </translate>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'

import { cloneStateObject } from '../../../helpers/store'
import MixinResources from '../../../mixins/resources'

export default {
  mixins: [MixinResources],
  computed: {
    ...mapGetters('Files', ['selectedFiles']),

    selectedResourcesAmount() {
      return this.selectedFiles.length
    },

    selectedResourcesSize() {
      const resources = cloneStateObject(this.selectedFiles)
      let size = 0

      for (const resource of resources) {
        size += parseInt(resource.size, 10)
      }

      return this.getResourceSize(size)
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
