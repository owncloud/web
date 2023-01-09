<template>
  <div>
    <oc-list class="oc-tiles oc-flex">
      <li v-for="(resource, index) in data" :key="resource.id" class="oc-tiles-item">
        <oc-tile
          :ref="`row-${index}`"
          :resource="resource"
          :resource-route="getRoute(resource)"
          @contextmenu="$emit('contextmenuClicked', $refs[`row-${index}`][0], $event, resource)"
          @click="emitTileClick(resource)"
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
import { defineComponent, PropType, computed } from 'vue'
import { useGettext } from 'vue3-gettext'
import { createLocationSpaces } from 'web-app-files/src/router'
import { Resource, SpaceResource } from 'web-client'
import { createFileRouteOptions } from 'web-pkg/src/helpers/router'
import { useStore } from 'web-pkg/src/composables'

// Constants should match what is being used in OcTable/ResourceTable
// Alignment regarding naming would be an API-breaking change and can
// Be done at a later point in time?
import { EVENT_TROW_CONTEXTMENU } from 'web-pkg/src/constants'
import { useResourceRouteResolver } from '../../composables/filesList'

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
  emits: ['contextmenuClicked', 'fileClick'],
  setup(props, context) {
    const store = useStore()
    const { $gettext } = useGettext()

    const spaces = computed(() => {
      return store.getters['runtime/spaces/spaces']
    })

    const resourceRouteResolver = useResourceRouteResolver({ spaces }, context)

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
      if (resource.type === 'folder') {
        return resourceRouteResolver.createFolderLink({
          path: resource.path,
          fileId: resource.fileId,
          resource: resource
        })
      }
      return { path: '' }
    }

    const emitTileClick = (resource) => {
      // Needs to handle file actions and potentially disabled folders also
      if (resource.disabled && resource.type === 'space') {
        store.dispatch('showMessage', {
          title: $gettext('Disabled spaces cannot be entered'),
          status: 'warning'
        })
      }
      if (resource.type !== 'space' && resource.type !== 'folder') {
        resourceRouteResolver.createFileAction(resource)
      }
    }

    return {
      getRoute,
      emitTileClick
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
