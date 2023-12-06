<template>
  <portal to="app.runtime.header.left">
    <div class="oc-app-top-bar oc-flex">
      <span class="oc-app-top-bar-inner oc-px-m oc-flex oc-flex-middle oc-flex-between">
        <div class="open-file-bar oc-flex">
          <oc-resource
            v-if="resource"
            id="app-top-bar-resource"
            :is-thumbnail-displayed="false"
            :path-prefix="pathPrefix"
            :resource="resource"
            :parent-folder-name="parentFolderName"
            :parent-folder-link-icon-additional-attributes="
              parentFolderLinkIconAdditionalAttributes
            "
            :is-path-displayed="isPathDisplayed"
          />
        </div>
        <div class="oc-flex main-actions">
          <template v-if="mainActions.length && resource">
            <context-action-menu
              :menu-sections="[
                {
                  name: 'main-actions',
                  items: mainActions
                    .filter((action) => action.isEnabled())
                    .map((action) => {
                      return { ...action, class: 'oc-p-xs', hideLabel: true }
                    })
                }
              ]"
              :action-options="{
                resources: [resource]
              }"
              appearance="raw-inverse"
              variation="brand"
            />
          </template>
          <template v-if="dropDownActions.length">
            <oc-button
              id="oc-openfile-contextmenu-trigger"
              v-oc-tooltip="contextMenuLabel"
              :aria-label="contextMenuLabel"
              appearance="raw-inverse"
              class="oc-p-xs"
              variation="brand"
            >
              <oc-icon name="more-2" />
            </oc-button>
            <oc-drop
              drop-id="oc-openfile-contextmenu"
              mode="click"
              padding-size="small"
              toggle="#oc-openfile-contextmenu-trigger"
              close-on-click
              @click.stop.prevent
            >
              <context-action-menu
                :menu-sections="[{ name: 'dropdown-actions', items: dropDownActions }]"
                :action-options="{ resources: [resource] }"
              />
            </oc-drop>
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
      <oc-button @click="toggleSideBar">
        {{ isSideBarOpen }}
        <oc-icon name="side-bar-right" />
      </oc-button>
    </div>
  </portal>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, unref } from 'vue'
import ContextActionMenu from './ContextActions/ContextActionMenu.vue'
import { useGettext } from 'vue3-gettext'
import {
  Action,
  SideBarEventTopics,
  useEventBus,
  useFolderLink,
  useGetMatchingSpace,
  useSideBar
} from '../composables'
import {
  Resource,
  isPublicSpaceResource,
  isShareSpaceResource
} from '@ownclouders/web-client/src/helpers'

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
      default: null
    }
  },
  emits: ['close'],
  setup(props) {
    const { $gettext } = useGettext()
    const eventBus = useEventBus()
    const { getMatchingSpace } = useGetMatchingSpace()

    const contextMenuLabel = computed(() => $gettext('Show context menu'))
    const closeButtonLabel = computed(() => $gettext('Close'))

    const { getParentFolderName, getParentFolderLinkIconAdditionalAttributes, getPathPrefix } =
      useFolderLink()

    const space = computed(() => getMatchingSpace(props.resource))

    //FIXME: We currently have problems to display the parent folder name of a shared file, so we disabled it for now
    const isPathDisplayed = computed(() => {
      return !isShareSpaceResource(unref(space)) && !isPublicSpaceResource(unref(space))
    })

    const pathPrefix = computed(() => {
      return props.resource ? getPathPrefix(props.resource) : null
    })

    const parentFolderName = computed(() => {
      return props.resource ? getParentFolderName(props.resource) : null
    })

    const parentFolderLinkIconAdditionalAttributes = computed(() => {
      return props.resource ? getParentFolderLinkIconAdditionalAttributes(props.resource) : null
    })

    const toggleSideBar = () => {
      eventBus.publish(SideBarEventTopics.toggle)
    }
    const { isSideBarOpen } = useSideBar()

    return {
      pathPrefix,
      isPathDisplayed,
      contextMenuLabel,
      closeButtonLabel,
      parentFolderName,
      parentFolderLinkIconAdditionalAttributes,
      isSideBarOpen,
      toggleSideBar
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
    grid-column: 2;
    grid-row: 1;
  }
}

.oc-app-top-bar-inner {
  align-self: center;
  background-color: var(--oc-color-components-apptopbar-background);
  border-radius: 10px;
  border: 1px solid var(--oc-color-components-apptopbar-border);
  display: inline-flex;
  gap: 25px;
  height: 40px;
  margin: 10px auto;
  width: 100%;

  @media (min-width: $oc-breakpoint-small-default) {
    flex-basis: 250px;
    margin: 0;
  }

  .oc-resource-indicators {
    .text {
      color: var(--oc-color-swatch-brand-contrast);
    }
  }
}

.open-file-bar {
  #app-top-bar-resource {
    max-width: 360px;

    @media (max-width: $oc-breakpoint-medium-default) {
      max-width: 240px;
    }

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
