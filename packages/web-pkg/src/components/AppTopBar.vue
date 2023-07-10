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
import { computed, defineComponent, PropType } from 'vue'
import { Resource } from 'web-client/src'
import { Action } from '../composables/actions/types'
import ContextActionMenu from 'web-pkg/src/components/ContextActions/ContextActionMenu.vue'
import { useGettext } from 'vue3-gettext'

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
  setup() {
    const { $gettext } = useGettext()

    const contextMenuLabel = computed(() => $gettext('Show context menu'))
    const closeButtonLabel = computed(() => $gettext('Close'))

    return {
      contextMenuLabel,
      closeButtonLabel
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
    grid-column: 1;
    grid-row: 1;
  }
}

.oc-app-top-bar-inner {
  align-self: center;
  background-color: var(--oc-color-components-apptopbar-background);
  border-radius: 15px;
  border: 1px solid var(--oc-color-components-apptopbar-border);
  display: inline-flex;
  gap: 25px;
  height: 40px;
  margin: 10px auto;
  width: 90%;

  @media (min-width: $oc-breakpoint-small-default) {
    flex-basis: 250px;
    margin-left: 13rem;
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
