<template>
  <div class="oc-flex oc-width-1-1">
    <app-loading-spinner v-if="areSpacesLoading" />
    <generic-space v-else :space="space" :item="item" />
  </div>
</template>

<script lang="ts">
import AppLoadingSpinner from 'web-pkg/src/components/AppLoadingSpinner.vue'
import GenericSpace from './Generic.vue'

import { defineComponent } from '@vue/composition-api'
import { useDriveResolver, useRouteParam, useStore } from 'web-pkg/src/composables'

export default defineComponent({
  components: {
    AppLoadingSpinner,
    GenericSpace
  },
  setup() {
    const store = useStore()
    const driveAliasAndItem = useRouteParam('driveAliasAndItem')
    return {
      ...useDriveResolver({ store, driveAliasAndItem })
    }
  }
})
</script>
