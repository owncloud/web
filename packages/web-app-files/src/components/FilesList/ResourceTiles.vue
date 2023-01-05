<template>
  <div>
    <oc-list class="oc-tiles oc-flex">
      <li v-for="(resource, index) in data" :key="resource.id" class="oc-tiles-item">
        <oc-tile
          :ref="`row-${index}`"
          :resource="resource"
          :resource-route="getRoute(resource)"
          @click="tileResourceClicked(resource, $event)"
          @contextmenu="$emit(EVENT_TROW_CONTEXTMENU, $refs[`row-${index}`][0], $event, resource)"
        >
          <template #imageField="{ item }">
            <slot name="image" :item="item" />
          </template>
          <template #actions="{ item }">
            <slot name="actions" :item="item" />
          </template>
        </oc-tile>
      </li>
    </oc-list>
    <!-- @slot Footer of the tiles list -->
    <slot name="footer" />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { createLocationSpaces } from 'web-app-files/src/router'
import { Resource, SpaceResource } from 'web-client'
import { createFileRouteOptions } from 'web-pkg/src/helpers/router'
import { useStore, useTranslations } from 'web-pkg/src/composables'

// Constants should match what is being used in OcTable/ResourceTable
// Alignment regarding naming would be an API-breaking change and can
// Be done at a later point in time?
import { EVENT_TROW_CONTEXTMENU } from '../../constants'

export default defineComponent({
  name: 'ResourceTiles',
  props: {
    /**
     * Array of resources (spaces, folders, files) to be displayed as tiles
     */
    data: {
      type: Array as PropType<Resource[]>,
      default: () => []
    }
  },
  setup() {
    const store = useStore()
    const { $gettext } = useTranslations()

    const getRoute = (resource) => {
      if (resource.type === 'space') {
        return resource.disabled
          ? { path: '#' }
          : createLocationSpaces(
              'files-spaces-generic',
              createFileRouteOptions(resource as SpaceResource, {
                path: '',
                fileId: resource.fileId
              })
            )
      }
      return { path: '#' }
    }

    const tileResourceClicked = (resource, event) => {
      // Needs to handle file actions and potentially disabled folders also
      if (resource.disabled && resource.type === 'space') {
        store.dispatch('showMessage', {
          title: $gettext('Disabled spaces cannot be entered'),
          status: 'warning'
        })
      }
    }

    return {
      EVENT_TROW_CONTEXTMENU,
      getRoute,
      tileResourceClicked
    }
  }
})
</script>

<style lang="scss" scoped>
.oc-tiles {
  flex-wrap: wrap;
  gap: 15px;
  justify-content: flex-start;

  .oc-tiles-item {
    width: 252px;

    @media (max-width: $oc-breakpoint-xsmall-max) {
      width: 100%;
    }
  }
}
</style>
