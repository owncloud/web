<template>
  <div>
    <oc-list class="oc-tiles oc-flex" :class="tileWidth === 'small' ? 'small-tiles' : ''">
      <li v-for="(resource, index) in data" :key="resource.id" class="oc-tiles-item">
        <oc-tile
          :ref="
            (el) => {
              tileRefs.tiles[index] = el
            }
          "
          :resource="resource"
          :resource-route="getRoute(resource)"
          @vue:mounted="$emit('rowMounted', resource, tileRefs.tiles[index], ImageDimension.Tile)"
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
                @click="resetDropPosition($event, index, tileRefs.dropBtns[index])"
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
import { Resource, SpaceResource } from 'web-client'
import { useStore } from 'web-pkg/src/composables'
import { ImageDimension } from 'web-pkg/src/constants'
import { createFileRouteOptions } from 'web-pkg/src/helpers/router'
import { displayPositionedDropdown } from 'web-pkg/src/helpers/contextMenuDropdown'
import { createLocationSpaces } from 'web-app-files/src/router'

// Constants should match what is being used in OcTable/ResourceTable
// Alignment regarding naming would be an API-breaking change and can
// Be done at a later point in time?
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
    },
    tileWidth: {
      type: String,
      default: ''
    },
    targetRouteCallback: {
      type: Function,
      required: false,
      default: undefined
    },
    space: {
      type: Object as PropType<SpaceResource>,
      required: false,
      default: null
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

    const resourceRouteResolver = useResourceRouteResolver(
      {
        space: ref(props.space),
        spaces,
        targetRouteCallback: computed(() => props.targetRouteCallback)
      },
      context
    )

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

    const resetDropPosition = (event, index, reference) => {
      const drop = tileRefs.value.dropEls[index].tippy

      if (drop === undefined) {
        return
      }
      displayPositionedDropdown(drop, event, reference)
    }

    const showContextMenu = (event, index, reference) => {
      event.preventDefault()
      const drop = tileRefs.value.dropEls[index]

      if (drop === undefined) {
        return
      }
      displayPositionedDropdown(drop.tippy, event, reference)
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
  column-gap: 1rem;
  display: grid;
  grid-template-columns: repeat(auto-fill, 14rem);
  justify-content: flex-start;
  row-gap: 1rem;

  &.small-tiles {
    grid-template-columns: repeat(auto-fill, 12rem);
  }

  @media only screen and (max-width: 640px) {
    grid-template-columns: 80%;
    justify-content: center;
    padding: var(--oc-space-medium) 0;

    &.small-tiles {
      grid-template-columns: 80%;
    }
  }
}
</style>
