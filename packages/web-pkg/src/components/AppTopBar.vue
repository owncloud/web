<template>
  <portal to="app.runtime.header.left">
    <div class="oc-app-top-bar oc-flex">
      <span class="oc-app-top-bar-inner oc-px-m oc-flex oc-flex-middle oc-flex-between">
        <div class="open-file-bar oc-flex">
          <oc-resource
            v-if="resource?.name"
            id="app-top-bar-resource"
            :is-thumbnail-displayed="false"
            :resource="resource"
          />
          <div v-else class="oc-resource oc-text-overflow">
            <span v-text="$gettext('Loading')" />
          </div>
          <template v-if="dropDownActions.length">
            <oc-button
              id="oc-openfile-contextmenu-trigger"
              v-oc-tooltip="contextMenuLabel"
              :aria-label="contextMenuLabel"
              appearance="raw"
            >
              <oc-icon name="more-2" />
            </oc-button>
            <oc-drop
              drop-id="oc-openfile-contextmenu"
              toggle="#oc-openfile-contextmenu-trigger"
              mode="click"
              close-on-click
              padding-size="small"
              @click.stop.prevent
            >
              <context-action-menu
                :menu-sections="[{ name: 'dropdown-actions', items: dropDownActions }]"
                :action-options="{ resources: [resource] }"
              />
            </oc-drop>
          </template>
        </div>

        <div class="oc-flex main-actions">
          <template v-if="mainActions.length">
            <context-action-menu
              :menu-sections="[{ name: 'main-actions', items: mainActions }]"
              :action-options="{ resources: [resource] }"
            />
          </template>
          <oc-button
            id="app-top-bar-close"
            v-oc-tooltip="closeButtonLabel"
            class="oc-p-rm"
            :aria-label="closeButtonLabel"
            size="small"
            appearance="raw"
            @click="$emit('close')"
          >
            <oc-icon name="close" size="small" />
          </oc-button>
        </div>
      </span>
    </div>
  </portal>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { Resource } from 'web-client/src'
import { Action } from '../composables/actions/types'
import ContextActionMenu from 'web-pkg/src/components/ContextActions/ContextActionMenu.vue'

export default defineComponent({
  name: 'AppTopBar',
  components: {
    ContextActionMenu
  },
  props: {
    dropDownActions: {
      type: Array as PropType<Action[]>,
      default: () => []
    },
    mainActions: {
      type: Array as PropType<Action[]>,
      default: () => []
    },
    resource: {
      type: Object as PropType<Resource>,
      default: () => {}
    }
  },
  emits: ['close'],
  computed: {
    contextMenuLabel() {
      return this.$gettext('Show context menu')
    },
    closeButtonLabel() {
      return this.$gettext('Close')
    }
  }
})
</script>

<style lang="scss">
.oc-app-top-bar {
  align-self: end;
  grid-column: 1 / 4;
  grid-row: secondRow;

  @media (min-width: $oc-breakpoint-small-default) {
    grid-column: 2 / 3;
    grid-row: initial;
  }
}

.oc-app-top-bar-inner {
  display: inline-flex;
  align-self: center;
  background-color: var(--oc-color-background-apptopbar);
  border-top-left-radius: 25px;
  border-top-right-radius: 25px;
  height: 45px;
  gap: 25px;
  width: 90%;
  margin: auto;

  @media (min-width: $oc-breakpoint-small-default) {
    flex-basis: 250px;
    width: 100%;
  }
}

.open-file-bar {
  #app-top-bar-resource {
    max-width: 50vw;

    @media (min-width: $oc-breakpoint-small-default) {
      widows: initial;
    }

    svg,
    .oc-resource-name span {
      fill: var(--oc-color-swatch-inverse-default) !important;
      color: var(--oc-color-swatch-inverse-default) !important;
    }
  }

  .oc-resource-icon:hover,
  .oc-resource-name:hover {
    cursor: default;
    text-decoration: none;
  }
}
</style>
