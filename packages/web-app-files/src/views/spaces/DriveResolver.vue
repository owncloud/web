<template>
  <div class="oc-flex oc-width-1-1">
    <app-loading-spinner v-if="areSpacesLoading" />
    <drive-redirect v-else-if="!space" :drive-alias-and-item="driveAliasAndItem" />
    <generic-space v-else :space="space" :item="item" />
  </div>
</template>

<script lang="ts">
import AppLoadingSpinner from 'web-pkg/src/components/AppLoadingSpinner.vue'
import GenericSpace from './Generic.vue'

import { defineComponent } from '@vue/composition-api'
import { useDriveResolver, useRouteParam, useStore } from 'web-pkg/src/composables'
import DriveRedirect from './DriveRedirect.vue'

export default defineComponent({
  components: {
    DriveRedirect,
    AppLoadingSpinner,
    GenericSpace
  },
  setup() {
    const store = useStore()
    const driveAliasAndItem = useRouteParam('driveAliasAndItem')
    return {
      ...useDriveResolver({ store, driveAliasAndItem }),
      driveAliasAndItem
    }
  }
})
</script>
