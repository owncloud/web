<template>
  <div class="oc-flex oc-width-1-1">
    <app-loading-spinner v-if="areSpacesLoading" />
    <drive-redirect
      v-else-if="!space"
      :drive-alias-and-item="driveAliasAndItem"
      :append-home-folder="isSpaceRoute"
    />
    <generic-trash v-else-if="isTrashRoute" :space="space" />
    <generic-space v-else :space="space" :item="item" />
  </div>
</template>

<script lang="ts">
import AppLoadingSpinner from 'web-pkg/src/components/AppLoadingSpinner.vue'
import DriveRedirect from './DriveRedirect.vue'
import GenericSpace from './GenericSpace.vue'
import GenericTrash from './GenericTrash.vue'

import { defineComponent } from '@vue/composition-api'
import { useDriveResolver, useRouteParam, useStore } from 'web-pkg/src/composables'
import { useActiveLocation } from '../../composables'
import { isLocationSpacesActive, isLocationTrashActive } from '../../router'

export default defineComponent({
  components: {
    DriveRedirect,
    AppLoadingSpinner,
    GenericSpace,
    GenericTrash
  },
  setup() {
    const store = useStore()
    const driveAliasAndItem = useRouteParam('driveAliasAndItem')
    const isSpaceRoute = useActiveLocation(isLocationSpacesActive, 'files-spaces-generic')
    const isTrashRoute = useActiveLocation(isLocationTrashActive, 'files-trash-generic')
    return {
      ...useDriveResolver({ store, driveAliasAndItem }),
      driveAliasAndItem,
      isSpaceRoute,
      isTrashRoute
    }
  }
})
</script>
