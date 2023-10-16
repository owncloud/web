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
import {
  defineComponent,
  PropType,
  ComponentPublicInstance,
  ref,
  computed,
  unref,
  watch
} from 'vue'
import { OcDrop } from 'design-system/src/components'
import OcApplicationIcon from 'design-system/src/components/OcApplicationIcon/OcApplicationIcon.vue'
import { useGettext } from 'vue3-gettext'
import * as uuid from 'uuid'
import {
  EDITOR_MODE_EDIT,
  resolveFileNameDuplicate,
  useClientService,
  useFileActions,
  useGetMatchingSpace,
  useLocalStorage,
  useRouteQuery,
  useRouter,
  useStore
} from '@ownclouders/web-pkg'
import { Resource, SpaceResource } from '@ownclouders/web-client'

export default defineComponent({
  components: {
    OcApplicationIcon
  },
  props: {
    applicationsList: {
      type: Array as PropType<any[]>,
      required: false,
      default: () => []
    }
  },
  setup(props) {
    const store = useStore()
    const { openEditor } = useFileActions()
    const clientService = useClientService()
    const { webdav } = clientService
    const { $gettext } = useGettext()
    const appIconKey = ref('')
    const { getMatchingSpace } = useGetMatchingSpace()
    const filesAppOpen = ref(false)

    const tempCreatedFiles = useLocalStorage('oc_tempFiles')

    if (!unref(tempCreatedFiles)) {
      tempCreatedFiles.value = { files: [] }
    }

    const addTempFile = (spaceWebDavPath: string, path: string, id: string) => {
      const temp = { ...tempCreatedFiles.value }
      temp['files'].push({ spaceWebDavPath, path, id })
      tempCreatedFiles.value = temp
    }

    const removeTempFile = (spaceWebDavPath: string, path: string, id: string) => {
      const temp = { ...tempCreatedFiles.value }
      const result = temp['files'].filter(
        (file) =>
          !(file.spaceWebDavPath === spaceWebDavPath && file.path === path && file.id === id)
      )
      temp['files'] = result
      tempCreatedFiles.value = temp
    }

    const getTempFileIds = (): Array<{ spaceWebDavPath: string; path: string; id: string }> => {
      return [...tempCreatedFiles.value['files']]
    }

    watch(
      () => props.applicationsList,
      () => {
        const filesApp = props.applicationsList.find((app) => app.id === 'files')
        if (!filesApp.active) {
          filesAppOpen.value = false
          return
        }
        filesAppOpen.value = true
      },
      { deep: true }
    )

    watch(
      () => unref(filesAppOpen),
      () => {
        if (!unref(filesAppOpen)) {
          return
        }
        const idsToRemove = getTempFileIds()
        idsToRemove.forEach(async (file) => {
          console.log(`Removing temp file ${file.path}`)
          const space = { webDavPath: file.spaceWebDavPath } as SpaceResource

          webdav.getFileInfo(space, { path: file.path }).then((resource) => {
            if (resource.size > 0) {
              return
            }
            webdav.deleteFile(space, { path: file.path }).then(() => {
              removeTempFile(file.spaceWebDavPath, file.path, file.id)
              store.commit('Files/REMOVE_FILES', [{ id: file.id }])
            })
          })
        })
      }
    )

    const applicationSwitcherLabel = computed(() => {
      return $gettext('Application Switcher')
    })
    const updateAppIcons = () => {
      appIconKey.value = uuid.v4().replaceAll('-', '')
    }
    const currentFolder = computed((): SpaceResource => {
      return store.getters['Files/currentFolder']
    })
    const files = computed((): Array<Resource> => store.getters['Files/files'])
    const onEditorApplicationClick = async (item: any) => {
      let fileName = $gettext('New file') + `.${item.defaultExtension}`

      if (unref(files).some((f) => f.name === fileName)) {
        fileName = resolveFileNameDuplicate(fileName, item.defaultExtension, unref(files))
      }

      const emptyResource = await webdav.putFileContents(unref(currentFolder), {
        path: fileName
      })

      const space = getMatchingSpace(emptyResource)
      addTempFile(space.webDavPath, emptyResource.path, emptyResource.id as string)

      openEditor(
        item,
        space.getDriveAliasAndItem(emptyResource),
        emptyResource.webDavPath,
        emptyResource.id,
        EDITOR_MODE_EDIT
      )
    }
    const getAdditionalEventBindings = (item: any) => {
      if (item.showInApplicationMenu && item.defaultExtension) {
        return {
          click: () => onEditorApplicationClick(item)
        }
      }
      return {}
    }
    const getAdditionalAttributes = (item: any) => {
      if (item.showInApplicationMenu) {
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
