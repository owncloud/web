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
          <oc-list class="oc-flex">
            <li
              v-for="space in spaces"
              :key="space.getDomSelector()"
              class="spaces-list-item oc-mb-m oc-mr-m"
            >
              <div
                class="spaces-list-card oc-card oc-card-default oc-rounded"
                :data-item-id="space.id"
                :class="getSpaceCardAdditionalClass(space)"
                @contextmenu="(event) => showSpaceContextDrop(event, space)"
              >
                <div class="oc-card-media-top oc-border-b">
                  <component
                    :is="space.disabled ? 'oc-button' : 'router-link'"
                    v-bind="getSpaceLinkProps(space)"
                    v-on="getSpaceLinkListeners(space)"
                  >
                    <oc-tag
                      v-if="space.disabled"
                      class="oc-position-absolute space-disabled-indicator"
                      type="span"
                    >
                      <span v-translate>Disabled</span>
                    </oc-tag>
                    <img
                      v-if="imageContentObject[space.id]"
                      class="space-image oc-rounded-top"
                      :src="imageContentObject[space.id]['data']"
                      alt=""
                    />
                    <oc-icon
                      v-else
                      name="layout-grid"
                      size="xxlarge"
                      class="space-default-image oc-px-m oc-py-m"
                    />
                  </component>
                </div>
                <div class="oc-card-body oc-p-s">
                  <div class="oc-flex oc-flex-between oc-flex-middle">
                    <div class="oc-flex oc-flex-middle oc-text-truncate">
                      <oc-icon class="oc-mr-s" name="layout-grid" />
                      <component
                        :is="space.disabled ? 'oc-button' : 'router-link'"
                        v-bind="getSpaceLinkProps(space)"
                        class="space-name oc-text-left oc-text-truncate"
                        v-on="getSpaceLinkListeners(space)"
                      >
                        <span v-text="space.name"> </span>
                      </component>
                    </div>
                    <div class="oc-flex oc-flex-middle">
                      <div>
                        <oc-button
                          v-oc-tooltip="$gettext('Show members')"
                          :aria-label="$gettext('Show members')"
                          appearance="raw"
                          @click="openSidebarSharePanel(space)"
                        >
                          <oc-icon name="group" fill-type="line" />
                        </oc-button>
                      </div>
                      <div>
                        <oc-button
                          :id="`space-context-btn-${space.getDomSelector()}`"
                          :ref="`spaceContextBtn-${space.getDomSelector()}`"
                          v-oc-tooltip="$gettext('Show context menu')"
                          :aria-label="$gettext('Show context menu')"
                          appearance="raw"
                          @click="(event) => showSpaceContextDrop(event, space)"
                        >
                          <oc-icon name="more-2" />
                        </oc-button>
                        <oc-drop
                          :ref="`spaceContextDrop-${space.getDomSelector()}`"
                          :drop-id="`space-context-drop-${space.getDomSelector()}`"
                          mode="manual"
                          close-on-click
                          :options="{ delayHide: 0 }"
                          padding-size="small"
                          position="bottom-end"
                        >
                          <space-context-actions :items="[space]" :space="space" />
                        </oc-drop>
                      </div>
                    </div>
                  </div>
                  <p
                    v-if="space.description"
                    class="oc-text-left oc-ml-xs oc-mt-xs oc-mb-rm oc-text-truncate"
                  >
                    <small v-text="space.description"></small>
                  </p>
                </div>
              </div>
            </li>
          </oc-list>
        </div>
      </template>
    </files-view-wrapper>
    <side-bar :open="sideBarOpen" :active-panel="sideBarActivePanel" :space="highlightedFile" />
  </div>
</template>

<script lang="ts">
import AppBar from '../../components/AppBar/AppBar.vue'
import CreateSpace from '../../components/AppBar/CreateSpace.vue'
import NoContentMessage from 'web-pkg/src/components/NoContentMessage.vue'
import AppLoadingSpinner from 'web-pkg/src/components/AppLoadingSpinner.vue'
import { computed, defineComponent, unref } from 'vue'
import { useAccessToken, useStore, useGraphClient } from 'web-pkg/src/composables'
import { useTask } from 'vue-concurrency'
import { mapMutations, mapActions, mapGetters } from 'vuex'
import { loadPreview } from 'web-pkg/src/helpers/preview'
import { ImageDimension } from '../../constants'
import SpaceContextActions from '../../components/Spaces/SpaceContextActions.vue'
import { configurationManager } from 'web-pkg/src/configuration'
import { isProjectSpaceResource, SpaceResource } from 'web-client/src/helpers'
import SideBar from '../../components/SideBar/SideBar.vue'
import FilesViewWrapper from '../../components/FilesViewWrapper.vue'
import { eventBus } from 'web-pkg/src/services/eventBus'
import { SideBarEventTopics, useSideBar } from '../../composables/sideBar'
import { WebDAV } from 'web-client/src/webdav'
import { createLocationSpaces } from '../../router'
import { createFileRouteOptions } from 'web-pkg/src/helpers/router'
import { useScrollTo } from 'web-app-files/src/composables/scrollTo'

export default defineComponent({
  components: {
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
            this.$set(this.imageContentObject, space.id, {
              fileId: space.spaceImageData.id,
              data: imageBlob
            })
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
    ...mapActions(['showMessage']),
    ...mapMutations('Files', ['SET_CURRENT_FOLDER', 'SET_FILE_SELECTION']),

    showSpaceContextDrop(event, space) {
      event.preventDefault()
      const drop = this.$refs[`spaceContextDrop-${space.getDomSelector()}`]?.[0]
      const contextMenuButtonPos =
        this.$refs[`spaceContextBtn-${space.getDomSelector()}`]?.[0].$el?.getBoundingClientRect()

      if (!drop || !contextMenuButtonPos) {
        return
      }

      drop.tippy.setProps({
        getReferenceClientRect: () => ({
          width: 0,
          height: 0,
          top: event.clientY,
          bottom: event.clientY,
          left: event.type === 'contextmenu' ? event.clientX : contextMenuButtonPos.x,
          right: event.type === 'contextmenu' ? event.clientX : contextMenuButtonPos.x
        })
      })
      drop.show()
    },
    getSpaceProjectRoute(space: SpaceResource) {
      return space.disabled
        ? '#'
        : createLocationSpaces(
            'files-spaces-generic',
            createFileRouteOptions(space, { path: '', fileId: space.fileId })
          )
    },

    getSpaceCardAdditionalClass(space) {
      if (space.disabled) {
        return 'state-trashed'
      }
      return ''
    },

    openSidebarSharePanel(space: SpaceResource) {
      this.SET_FILE_SELECTION([space])
      eventBus.publish(SideBarEventTopics.openWithPanel, 'space-share-item')
    },

    getSpaceLinkProps(space: SpaceResource) {
      if (space.disabled) {
        return {
          appearance: 'raw'
        }
      }
      return { to: this.getSpaceProjectRoute(space) }
    },

    getSpaceLinkListeners(space) {
      if (!space.disabled) {
        return {}
      }

      return {
        click: () => {
          this.showMessage({
            title: this.$gettext('Disabled spaces cannot be entered'),
            status: 'warning'
          })
        }
      }
    }
  }
})
</script>

<style lang="scss">
#files-spaces-empty {
  height: 75vh;
}

.spaces-list {
  ul {
    flex-wrap: wrap;
  }

  &-item {
    width: 252px;
  }

  &-card {
    box-shadow: none !important;
    background-color: var(--oc-color-background-highlight) !important;
    height: 100%;
  }

  &-card.state-trashed {
    .space-image,
    .space-default-image > svg {
      filter: grayscale(100%);
      opacity: 80%;
    }
  }

  .oc-card-media-top {
    aspect-ratio: 16/9;
  }

  .oc-card-media-top a {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
  }

  .oc-card-media-top button {
    width: 100%;
    height: 100%;
  }

  .oc-tag {
    color: var(--oc-color-text-default);
  }

  .space-image {
    width: 100%;
    aspect-ratio: 16/9;
    object-fit: cover;
  }

  .space-name {
    overflow: hidden;
    color: var(--oc-color-text-default);
  }

  .space-disabled-indicator {
    z-index: 999;
  }

  .spaces-list-projects {
    aspect-ratio: 16/9;
  }
}
</style>
