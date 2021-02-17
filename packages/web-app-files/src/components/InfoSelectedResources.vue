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
    <span class="oc-ml-s oc-mr-s">|</span>
    <oc-button variation="raw" @click="RESET_SELECTION">
      <translate>Clear selection</translate>
    </oc-button>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'

import { cloneStateObject } from '../helpers/store'
import { getResourceSize } from '../helpers/resources'

export default {
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

      return getResourceSize(size)
    }
  },

  methods: {
    ...mapMutations('Files', ['RESET_SELECTION'])
  }
}
</script>
