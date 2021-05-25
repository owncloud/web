<template>
  <div class="uk-flex uk-flex-middle">
    <translate
      v-if="selectedResourcesSize !== '?'"
      key="multiple-select-info"
      :translate-n="selectedResourcesAmount"
      :translate-params="{ amount: selectedResourcesAmount, size: selectedResourcesSize }"
      translate-plural="%{ amount } selected items - %{ size }"
      translate-comment="Number of selected resources and their size displayed above the files list"
      >%{ amount } selected item - %{ size }
    </translate>
    <translate
      v-else
      key="multiple-select-info-with-size"
      :translate-n="selectedResourcesAmount"
      :translate-params="{ amount: selectedResourcesAmount }"
      translate-plural="%{ amount } selected items"
      translate-comment="Number of selected resources displayed above the files list"
      >%{ amount } selected item
    </translate>
    <oc-button
      v-oc-tooltip="clearSelectionLabel"
      :aria-label="clearSelectionLabel"
      class="oc-ml oc-mr-xs"
      @click="RESET_SELECTION"
    >
      <oc-icon name="close" />
    </oc-button>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'

import { cloneStateObject } from '../helpers/store'
import MixinResources from '../mixins/resources'

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
