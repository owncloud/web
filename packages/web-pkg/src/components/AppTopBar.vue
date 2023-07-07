<template>
  <portal to="app.runtime.header.left">
    <div class="oc-app-top-bar oc-flex">
      <span class="oc-app-top-bar-inner oc-px-m oc-flex oc-flex-middle oc-flex-between">
        <div class="open-file-bar oc-flex">
          <oc-resource
            v-if="resource"
            id="app-top-bar-resource"
            :is-thumbnail-displayed="false"
            :resource="resource"
          />
        </div>

        <div class="oc-flex main-actions">
          <template v-if="mainActions.length && resource">
            <context-action-menu
              :menu-sections="[
                {
                  name: 'main-actions',
                  items: mainActions
                }
              ]"
              :action-options="{
                resources: [resource]
              }"
              appearance="raw-inverse"
              variation="brand"
            />
          </template>
          <oc-button
            id="app-top-bar-close"
            v-oc-tooltip="closeButtonLabel"
            appearance="raw-inverse"
            variation="brand"
            :aria-label="closeButtonLabel"
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
    mainActions: {
      type: Array as PropType<Action[]>,
      default: () => []
    },
    resource: {
      type: Object as PropType<Resource>,
      default: null
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
  align-self: center;
  grid-column: 1 / 4;
  grid-row: secondRow;

  @media (min-width: $oc-breakpoint-small-default) {
    grid-column: 2 / 3;
    grid-row: initial;
  }
}

.oc-app-top-bar-inner {
  align-self: center;
  background-color: var(--oc-components-apptopbar-background);
  border-radius: 15px;
  border: 1px solid var(--oc-components-apptopbar-border);
  display: inline-flex;
  gap: 25px;
  height: 40px;
  margin: 10px auto;
  width: 90%;

  @media (min-width: $oc-breakpoint-small-default) {
    flex-basis: 250px;
    margin: 0 auto;
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
