<template>
  <div class="oc-flex">
    <files-view-wrapper>
      <app-bar
        :breadcrumbs="breadcrumbs"
        :has-sidebar-toggle="true"
        :show-actions-on-selection="true"
        :has-bulk-actions="true"
        :has-hidden-files="false"
        :has-file-extensions="false"
        :has-pagination="false"
        :side-bar-open="sideBarOpen"
        :view-modes="viewModes"
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
            <span v-text="$gettext('You don\'t have access to any spaces')" />
          </template>
        </no-content-message>
        <div v-else class="spaces-list oc-px-m oc-mt-l">
          <resource-tiles
            v-model:selectedIds="selectedResourcesIds"
            :data="spaces"
            :resizable="true"
            :sort-fields="sortFields"
            :sort-by="sortBy"
            :sort-dir="sortDir"
            @sort="handleSort"
          >
            <template #image="{ resource }">
              <img
                v-if="imageContentObject[resource.id]"
                class="tile-preview"
                :src="imageContentObject[resource.id]['data']"
                alt=""
              />
            </template>
            <template #actions="{ resource }">
              <oc-button
                v-oc-tooltip="showSpaceMemberLabel"
                :aria-label="showSpaceMemberLabel"
                appearance="raw"
                @click="openSidebarSharePanel(resource)"
              >
                <oc-icon name="group" fill-type="line" />
              </oc-button>
            </template>
            <template #contextMenuActions="{ resource }">
              <space-context-actions :space="resource" :items="[resource]" />
            </template>
          </resource-tiles>
        </div>
      </template>
    </files-view-wrapper>
    <side-bar :open="sideBarOpen" :active-panel="sideBarActivePanel" :space="highlightedFile" />
  </div>
</template>

<script lang="ts">
import { onMounted, computed, defineComponent, unref } from 'vue'
import { useTask } from 'vue-concurrency'
import { mapMutations, mapGetters } from 'vuex'

import NoContentMessage from 'web-pkg/src/components/NoContentMessage.vue'
import AppLoadingSpinner from 'web-pkg/src/components/AppLoadingSpinner.vue'

import AppBar from '../../components/AppBar/AppBar.vue'
import CreateSpace from '../../components/AppBar/CreateSpace.vue'
import { useAbility, useAccessToken, useStore, useGraphClient } from 'web-pkg/src/composables'
import { loadPreview } from 'web-pkg/src/helpers/preview'
import { ImageDimension } from 'web-pkg/src/constants'
import SpaceContextActions from '../../components/Spaces/SpaceContextActions.vue'
import { configurationManager } from 'web-pkg/src/configuration'
import { isProjectSpaceResource, Resource, SpaceResource } from 'web-client/src/helpers'
import SideBar from '../../components/SideBar/SideBar.vue'
import FilesViewWrapper from '../../components/FilesViewWrapper.vue'
import ResourceTiles from '../../components/FilesList/ResourceTiles.vue'
import { eventBus } from 'web-pkg/src/services/eventBus'
import { SideBarEventTopics, useSideBar } from 'web-pkg/src/composables/sideBar'
import { WebDAV } from 'web-client/src/webdav'
import { useScrollTo } from 'web-app-files/src/composables/scrollTo'
import { useSelectedResources, useSort, ViewModeConstants } from 'web-app-files/src/composables'
import { sortFields as availableSortFields } from '../../helpers/ui/resourceTiles'

export default defineComponent({
  components: {
    AppBar,
    AppLoadingSpinner,
    CreateSpace,
    FilesViewWrapper,
    NoContentMessage,
    ResourceTiles,
    SideBar,
    SpaceContextActions
  },
  setup() {
    const store = useStore()
    const { selectedResourcesIds } = useSelectedResources({ store })
    const { can } = useAbility()

    const runtimeSpaces = computed(
      () => store.getters['runtime/spaces/spaces'].filter((s) => isProjectSpaceResource(s)) || []
    )

    const sortFields = [availableSortFields[0], availableSortFields[1]]
    const {
      sortBy,
      sortDir,
      items: spaces,
      handleSort
    } = useSort({
      items: runtimeSpaces,
      fields: sortFields
    })

    const accessToken = useAccessToken({ store })
    const { graphClient } = useGraphClient()

    const { scrollToResourceFromRoute } = useScrollTo()

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

    const hasCreatePermission = computed(() => can('create-all', 'Space'))
    const viewModes = computed(() => [ViewModeConstants.tilesView])

    onMounted(async () => {
      await loadResourcesTask.perform()
      scrollToResourceFromRoute(unref(spaces) as Resource[])
    })

    return {
      ...useSideBar(),
      spaces,
      graphClient,
      loadResourcesTask,
      areResourcesLoading,
      accessToken,
      selectedResourcesIds,
      handleSort,
      sortBy,
      sortDir,
      sortFields,
      hasCreatePermission,
      viewModes
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
            dimensions: ImageDimension.Tile,
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
  methods: {
    ...mapMutations('Files', ['SET_FILE_SELECTION']),
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
  .tile-preview,
  .tile-default-image > svg {
    filter: grayscale(100%);
    opacity: 80%;
  }
}
</style>
