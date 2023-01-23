<template>
  <div class="oc-flex">
    <files-view-wrapper>
      <app-bar
        :breadcrumbs="breadcrumbs"
        :has-view-options="false"
        :has-sidebar-toggle="true"
        :show-actions-on-selection="true"
        :side-bar-open="sideBarOpen"
      >
        <template #actions>
          <create-space v-if="hasCreatePermission" />
        </template>
      </app-bar>
      <app-loading-spinner v-if="areResourcesLoading" />
      <template v-else>
        <no-content-message
          v-if="!spaces.length"
          id="files-spaces-empty"
          class="files-empty"
          icon="layout-grid"
        >
          <template #message>
            <span v-translate>You don't have access to any spaces</span>
          </template>
        </no-content-message>
        <div v-else class="spaces-list oc-px-m oc-mt-l">
          <resource-tiles :data="spaces" @contextmenuClicked="showContextMenu">
            <template #image="{ item }">
              <img
                v-if="imageContentObject[item.id]"
                class="space-image tile-image oc-rounded-top"
                :src="imageContentObject[item.id]['data']"
                alt=""
              />
            </template>
            <template #actions="{ item }">
              <div>
                <oc-button
                  v-oc-tooltip="showSpaceMemberLabel"
                  :aria-label="showSpaceMemberLabel"
                  appearance="raw"
                  @click="openSidebarSharePanel(item)"
                >
                  <oc-icon name="group" fill-type="line" />
                </oc-button>
              </div>
              <div>
                <oc-button
                  :id="`space-context-btn-${item.getDomSelector()}`"
                  :ref="`spaceContextBtn-${item.getDomSelector()}`"
                  v-oc-tooltip="contextMenuLabel"
                  :aria-label="contextMenuLabel"
                  appearance="raw"
                  @click.stop.prevent="resetDropPosition($event, item)"
                >
                  <oc-icon name="more-2" />
                </oc-button>
                <oc-drop
                  :ref="`spaceContextDrop-${item.getDomSelector()}`"
                  :drop-id="`space-context-drop-${item.getDomSelector()}`"
                  close-on-click
                  mode="manual"
                  :options="{ delayHide: 0 }"
                  padding-size="small"
                >
                  <space-context-actions :space="item" :items="[item]" />
                </oc-drop>
              </div>
            </template>
          </resource-tiles>
        </div>
      </template>
    </files-view-wrapper>
    <side-bar :open="sideBarOpen" :active-panel="sideBarActivePanel" :space="highlightedFile" />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, unref } from 'vue'
import { useTask } from 'vue-concurrency'
import { mapMutations, mapGetters } from 'vuex'

import NoContentMessage from 'web-pkg/src/components/NoContentMessage.vue'
import AppLoadingSpinner from 'web-pkg/src/components/AppLoadingSpinner.vue'

import AppBar from '../../components/AppBar/AppBar.vue'
import CreateSpace from '../../components/AppBar/CreateSpace.vue'
import { useAccessToken, useStore, useGraphClient } from 'web-pkg/src/composables'
import { loadPreview } from 'web-pkg/src/helpers/preview'
import { ImageDimension } from 'web-pkg/src/constants'
import SpaceContextActions from '../../components/Spaces/SpaceContextActions.vue'
import { configurationManager } from 'web-pkg/src/configuration'
import { isProjectSpaceResource, SpaceResource } from 'web-client/src/helpers'
import SideBar from '../../components/SideBar/SideBar.vue'
import FilesViewWrapper from '../../components/FilesViewWrapper.vue'
import ResourceTiles from '../../components/FilesList/ResourceTiles.vue'
import { eventBus } from 'web-pkg/src/services/eventBus'
import { SideBarEventTopics, useSideBar } from 'web-pkg/src/composables/sideBar'
import { WebDAV } from 'web-client/src/webdav'
import { useScrollTo } from 'web-app-files/src/composables/scrollTo'

export default defineComponent({
  components: {
    ResourceTiles,
    FilesViewWrapper,
    SideBar,
    AppBar,
    AppLoadingSpinner,
    CreateSpace,
    NoContentMessage,
    SpaceContextActions
  },
  setup() {
    const store = useStore()
    const spaces = computed(
      () =>
        store.getters['runtime/spaces/spaces']
          .filter((s) => isProjectSpaceResource(s))
          .sort((a, b) => a.name.localeCompare(b.name)) || []
    )
    const accessToken = useAccessToken({ store })
    const { graphClient } = useGraphClient()

    const loadResourcesTask = useTask(function* () {
      store.commit('Files/CLEAR_FILES_SEARCHED')
      store.commit('Files/CLEAR_CURRENT_FILES_LIST')
      yield store.dispatch('runtime/spaces/reloadProjectSpaces', {
        graphClient: unref(graphClient)
      })
      store.commit('Files/LOAD_FILES', { currentFolder: null, files: unref(spaces) })
    })

    const areResourcesLoading = computed(() => {
      return loadResourcesTask.isRunning || !loadResourcesTask.last
    })

    return {
      ...useSideBar(),
      ...useScrollTo(),
      spaces,
      graphClient,
      loadResourcesTask,
      areResourcesLoading,
      accessToken
    }
  },
  data: function () {
    return {
      imageContentObject: {}
    }
  },
  computed: {
    ...mapGetters(['user']),
    ...mapGetters('Files', ['highlightedFile']),
    breadcrumbs() {
      return [
        {
          text: this.$gettext('Spaces'),
          onClick: () => this.loadResourcesTask.perform()
        }
      ]
    },
    showSpaceMemberLabel() {
      return this.$gettext('Show members')
    },
    contextMenuLabel() {
      return this.$gettext('Show context menu')
    },
    hasCreatePermission() {
      return this.$permissionManager.hasSpaceManagement()
    }
  },
  watch: {
    spaces: {
      handler: async function (val) {
        if (!val) {
          return
        }

        for (const space of this.spaces as SpaceResource[]) {
          if (!space.spaceImageData) {
            continue
          }

          if (this.imageContentObject[space.id]?.fileId === space.spaceImageData?.id) {
            continue
          }

          const decodedUri = decodeURI(space.spaceImageData.webDavUrl)
          const webDavPathComponents = decodedUri.split('/')
          const idComponent = webDavPathComponents.find((c) => c.startsWith(`${space.id}`))
          if (!idComponent) {
            return
          }
          const path = webDavPathComponents
            .slice(webDavPathComponents.indexOf(idComponent) + 1)
            .join('/')

          const resource = await (this.$clientService.webdav as WebDAV).getFileInfo(space, { path })
          loadPreview({
            resource,
            isPublic: false,
            dimensions: ImageDimension.Preview,
            server: configurationManager.serverUrl,
            userId: this.user.id,
            token: this.accessToken
          }).then((imageBlob) => {
            this.imageContentObject[space.id] = {
              fileId: space.spaceImageData.id,
              data: imageBlob
            }
          })
        }
      },
      deep: true,
      immediate: true
    }
  },
  async created() {
    await this.loadResourcesTask.perform()
    this.scrollToResourceFromRoute(this.spaces)
  },
  methods: {
    ...mapMutations('Files', ['SET_FILE_SELECTION']),

    resetDropPosition(event, item) {
      const drop = this.$refs[`spaceContextDrop-${item.getDomSelector()}`]

      if (drop === undefined) {
        return
      }
      this.displayPositionedDropdown(drop, event, item)
    },
    showContextMenu(_row, event, item) {
      event.preventDefault()
      const drop = this.$refs[`spaceContextDrop-${item.getDomSelector()}`]

      this.displayPositionedDropdown(drop, event, item)
    },
    displayPositionedDropdown(dropdown, event, item) {
      const contextMenuButtonPos =
        this.$refs[`spaceContextBtn-${item.getDomSelector()}`].$el.getBoundingClientRect()

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
    },
    openSidebarSharePanel(space: SpaceResource) {
      this.SET_FILE_SELECTION([space])
      eventBus.publish(SideBarEventTopics.openWithPanel, 'space-share')
    }
  }
})
</script>

<style lang="scss">
#files-spaces-empty {
  height: 75vh;
}

.state-trashed {
  .tile-image,
  .tile-default-image > svg {
    filter: grayscale(100%);
    opacity: 80%;
  }
}

.space-image {
  width: 100%;
  aspect-ratio: 16/9;
  object-fit: cover;
}
</style>
