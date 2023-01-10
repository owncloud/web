<template>
  <div>
    <oc-list class="oc-tiles oc-flex">
      <li v-for="(resource, index) in data" :key="resource.id" class="oc-tiles-item">
        <oc-tile
          :ref="
            (el) => {
              tileRefs.tiles[index] = el
            }
          "
          :resource="resource"
          :resource-route="getRoute(resource)"
          @hook:mounted="$emit('rowMounted', resource, tileRefs.tiles[index], ImageDimension.Tile)"
          @contextmenu="showContextMenu($event, index, tileRefs.tiles[index])"
          @click="emitTileClick(resource)"
        >
          <template #imageField>
            <slot name="image" :resource="resource" />
          </template>
          <template #actions>
            <slot name="actions" :resource="resource" />
          </template>
          <template #contextMenu>
            <div>
              <oc-button
                :id="`space-context-btn-${resource.getDomSelector()}`"
                :ref="
                  (el) => {
                    tileRefs.dropBtns[index] = el
                  }
                "
                v-oc-tooltip="contextMenuLabel"
                :aria-label="contextMenuLabel"
                appearance="raw"
                @click="resetDropPosition($event, index, tileRefs.tiles[index])"
              >
                <oc-icon name="more-2" />
              </oc-button>
              <oc-drop
                :ref="
                  (el) => {
                    tileRefs.dropEls[index] = el
                  }
                "
                :drop-id="`space-context-drop-${resource.getDomSelector()}`"
                close-on-click
                mode="manual"
                :options="{ delayHide: 0 }"
                padding-size="small"
              >
                <slot name="contextMenuActions" :resource="resource" />
              </oc-drop>
            </div>
          </template>
        </oc-tile>
      </li>
    </oc-list>
    <!-- @slot Footer of the tiles list -->
    <slot name="footer" />
  </div>
</template>

<script lang="ts">
import { onBeforeUpdate, defineComponent, PropType, computed, ref } from 'vue'
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
import { ImageDimension } from 'web-app-files/src/constants'

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
  emits: ['fileClick', 'rowMounted'],
  setup(props, context) {
    const store = useStore()
    const { $gettext } = useGettext()

    const tileRefs = ref({
      tiles: [],
      dropBtns: [],
      dropEls: []
    })

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

    const contextMenuLabel = computed(() => {
      return $gettext('Show context menu')
    })

    const displayPositionedDropdown = (dropdown, event, reference) => {
      const contextMenuButtonPos = reference.$el.getBoundingClientRect()

      if (!dropdown || !contextMenuButtonPos) {
        return
      }

      dropdown.tippy.setProps({
        getReferenceClientRect: () => ({
          width: 0,
          height: 0,
          top: event.clientY,
          bottom: event.clientY,
          left: event.type === 'contextmenu' ? event.clientX : contextMenuButtonPos.x,
          right: event.type === 'contextmenu' ? event.clientX : contextMenuButtonPos.x
        })
      })
      dropdown.show()
    }

    const resetDropPosition = (event, index, reference) => {
      const drop = tileRefs.value.dropEls[index]

      // Doesn't seem to work properly, second click on three dots doesn't close the menu anymore
      if (drop === undefined) {
        return
      }
      displayPositionedDropdown(drop, event, reference)
    }

    const showContextMenu = (event, index, reference) => {
      event.preventDefault()
      const drop = tileRefs.value.dropEls[index]

      displayPositionedDropdown(drop, event, reference)
    }

    onBeforeUpdate(() => {
      tileRefs.value = {
        tiles: [],
        dropBtns: [],
        dropEls: []
      }
    })

    return {
      contextMenuLabel,
      emitTileClick,
      getRoute,
      resetDropPosition,
      showContextMenu,
      tileRefs
    }
  },
  data() {
    return {
      ImageDimension
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
