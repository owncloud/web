<template>
  <nav
    id="applications-menu"
    :aria-label="$gettext('Main navigation')"
    class="oc-flex oc-flex-middle"
  >
    <oc-button
      id="_appSwitcherButton"
      ref="menubutton"
      v-oc-tooltip="applicationSwitcherLabel"
      appearance="raw-inverse"
      variation="brand"
      class="oc-topbar-menu-burger"
      :aria-label="applicationSwitcherLabel"
    >
      <oc-icon name="grid" size="large" class="oc-flex" />
    </oc-button>
    <oc-drop
      ref="menu"
      drop-id="app-switcher-dropdown"
      toggle="#_appSwitcherButton"
      mode="click"
      padding-size="small"
      close-on-click
      @show-drop="updateAppIcons"
    >
      <div class="oc-display-block oc-position-relative">
        <oc-list class="applications-list">
          <li v-for="(n, nid) in applicationsList" :key="`apps-menu-${nid}`">
            <oc-button
              :key="n.url ? 'apps-menu-external-link' : 'apps-menu-internal-link'"
              :appearance="n.active ? 'raw-inverse' : 'raw'"
              :variation="n.active ? 'primary' : 'passive'"
              :class="{ 'oc-background-primary-gradient router-link-active': n.active }"
              :data-test-id="n.id"
              v-bind="getAdditionalAttributes(n)"
              v-on="getAdditionalEventBindings(n)"
            >
              <oc-application-icon
                :key="`apps-menu-icon-${nid}-${appIconKey}`"
                :icon="n.icon"
                :color-primary="n.color"
              />
              <span v-text="$gettext(n.title)" />
            </oc-button>
          </li>
        </oc-list>
      </div>
    </oc-drop>
  </nav>
</template>

<script lang="ts">
import { defineComponent, PropType, ComponentPublicInstance, ref, computed, unref } from 'vue'
import { OcDrop } from 'design-system/src/components'
import OcApplicationIcon from 'design-system/src/components/OcApplicationIcon/OcApplicationIcon.vue'
import { useGettext } from 'vue3-gettext'
import * as uuid from 'uuid'
import {
  EDITOR_MODE_EDIT,
  resolveFileNameDuplicate,
  useAppsStore,
  useClientService,
  useFileActions,
  useGetMatchingSpace,
  useResourcesStore,
  useSpacesStore
} from '@ownclouders/web-pkg'
import { urlJoin } from '@ownclouders/web-client'
import { storeToRefs } from 'pinia'
import { MenuItem } from '../../helpers/menuItems'

export default defineComponent({
  components: {
    OcApplicationIcon
  },
  props: {
    applicationsList: {
      type: Array as PropType<MenuItem[]>,
      required: false,
      default: (): MenuItem[] => []
    }
  },
  setup() {
    const { openEditor } = useFileActions()
    const clientService = useClientService()
    const { $gettext } = useGettext()
    const appIconKey = ref('')
    const { getMatchingSpace } = useGetMatchingSpace()
    const spacesStore = useSpacesStore()
    const appsStore = useAppsStore()

    const resourcesStore = useResourcesStore()
    const { resources, currentFolder } = storeToRefs(resourcesStore)

    const applicationSwitcherLabel = computed(() => {
      return $gettext('Application Switcher')
    })
    const updateAppIcons = () => {
      appIconKey.value = uuid.v4().replaceAll('-', '')
    }

    const onEditorApplicationClick = async (item: MenuItem) => {
      let destinationSpace = unref(currentFolder) ? getMatchingSpace(unref(currentFolder)) : null
      let destinationFiles = unref(resources)

      if (!destinationSpace || !unref(currentFolder).canCreate()) {
        destinationSpace = spacesStore.personalSpace
        destinationFiles = (await clientService.webdav.listFiles(destinationSpace)).children
      }

      let fileName = $gettext('New file') + `.${item.defaultExtension}`

      if (destinationFiles.some((f) => f.name === fileName)) {
        fileName = resolveFileNameDuplicate(fileName, item.defaultExtension, destinationFiles)
      }

      const emptyResource = await clientService.webdav.putFileContents(destinationSpace, {
        fileId: unref(currentFolder).id,
        fileName
      })

      const space = getMatchingSpace(emptyResource)
      const appFileExtension = appsStore.fileExtensions.find(
        ({ app, extension }) => app === item.id && extension === item.defaultExtension
      )

      openEditor(appFileExtension, space, emptyResource, EDITOR_MODE_EDIT)
    }
    const getAdditionalEventBindings = (item: MenuItem) => {
      if (item?.openAsEditor) {
        return {
          click: () => onEditorApplicationClick(item)
        }
      }
      return {}
    }
    const getAdditionalAttributes = (item: MenuItem) => {
      if (item?.openAsEditor) {
        return {}
      }
      return {
        type: item.url ? 'a' : 'router-link',
        target: item.target,
        href: item.url,
        to: item.path
      }
    }

    return {
      appIconKey,
      updateAppIcons,
      applicationSwitcherLabel,
      getAdditionalAttributes,
      getAdditionalEventBindings
    }
  },
  mounted() {
    ;(this.$refs.menu as InstanceType<typeof OcDrop>)?.tippy?.setProps({
      onHidden: () => (this.$refs.menubutton as ComponentPublicInstance).$el.focus(),
      onShown: () =>
        (this.$refs.menu as ComponentPublicInstance).$el.querySelector('a:first-of-type').focus()
    })
  }
})
</script>

<style lang="scss" scoped>
.oc-drop {
  width: 280px;
}

.applications-list li {
  margin: var(--oc-space-xsmall) 0;

  &:first-child {
    margin-top: 0;
  }

  &:last-child {
    margin-bottom: 0;
  }

  a,
  button {
    padding: 5px;
    border-radius: 8px;
    gap: var(--oc-space-medium);
    justify-content: flex-start;
    width: 100%;

    &.oc-button-primary-raw-inverse {
      &:focus,
      &:hover {
        color: var(--oc-color-swatch-primary-contrast) !important;
      }
    }

    &.oc-button-passive-raw {
      &:focus,
      &:hover {
        color: var(--oc-color-swatch-passive-default) !important;
      }
    }

    &:focus {
      text-decoration: none;
    }

    &:hover {
      background-color: var(--oc-color-background-hover);
      text-decoration: none;
    }

    .icon-box {
      display: inline-flex;
      justify-content: center;
      align-items: center;
      width: 40px;
      height: 40px;
    }

    .active-check {
      position: absolute;
      right: 1rem;
    }
  }
}
</style>
