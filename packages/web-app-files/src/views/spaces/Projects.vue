<template>
  <div class="oc-flex">
    <files-view-wrapper>
      <app-bar
        :breadcrumbs="breadcrumbs"
        :has-view-options="false"
        :has-sidebar-toggle="true"
        :show-actions-on-selection="true"
        :has-bulk-actions="true"
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
            <span v-translate>You don't have access to any Project</span>
          </template>
        </no-content-message>
        <div v-else class="spaces-list oc-px-m oc-mt-l">
          <resource-tiles
            v-model:selectedIds="selectedResourcesIds"
            :data="spaces"
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
              <!-- <oc-button
                v-oc-tooltip="showSpaceMemberLabel"
                :aria-label="showSpaceMemberLabel"
                appearance="raw"
                @click="openSidebarSharePanel(resource)"
              >
                <oc-icon name="group" fill-type="line" />
              </oc-button> -->
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
import { useSelectedResources, useSort } from 'web-app-files/src/composables'
import { sortFields as availableSortFields } from '../../helpers/ui/resourceTiles'
import { buildSpace } from 'web-client/src/helpers'

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


    const runtimeSpaces = computed(() => store.getters['Files/activeFiles'] || [])

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

    const loadResourcesTask = useTask(function* (signal, ref) {
      store.commit('Files/CLEAR_FILES_SEARCHED')
      store.commit('Files/CLEAR_CURRENT_FILES_LIST')
      /*
      yield store.dispatch('runtime/spaces/reloadProjectSpaces', {
        graphClient: unref(graphClient)
      })
      */
      let loadedSpaces = yield ref.getProjects(accessToken.value)

      loadedSpaces = loadedSpaces.map((s) =>
        buildSpace({ ...s, serverUrl: configurationManager.serverUrl })
      )
      store.commit('CLEAR_PROJECT_SPACES')
      store.commit('Files/LOAD_FILES', { currentFolder: null, files: loadedSpaces })
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
      accessToken,
      selectedResourcesIds,
      handleSort,
      sortBy,
      sortDir,
      sortFields
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
          text: this.$gettext('Projects'),
          onClick: () => this.loadResourcesTask.perform(this)
        }
      ]
    },
    showSpaceMemberLabel() {
      return this.$gettext('Show members')
    },
    hasCreatePermission() {
      return !this.user.isLightweight
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
  async created() {
    await this.loadResourcesTask.perform(this)
    this.scrollToResourceFromRoute(this.spaces)
  },
  methods: {
    ...mapMutations('Files', ['SET_FILE_SELECTION']),
    async getProjects(accessToken) {
      const headers = new Headers()
      headers.append('Authorization', 'Bearer ' + accessToken)
      headers.append('X-Requested-With', 'XMLHttpRequest')
      const response = await fetch('api/v0/projects', {
        method: 'GET',
        headers
      })
      if (!response.ok) {
        const message = `An error has occured: ${response.status}`
        throw new Error(message)
      }
      const data = await response.json()

      // const data = {
      //   projects: [
      //     {
      //       name: 'cernbox',
      //       path: '/eos/project/c/cernbox',
      //       permissions: 'admin'
      //     },
      //     {
      //       name: 'awesomeproject',
      //       path: '/eos/project/a/awesomeproject',
      //       permissions: 'admin'
      //     }
      //   ]
      // }

      let projects = []
      data.projects.forEach((project) => {
        projects.push({
          name: project.name,
          id: project.name,
          //driveType: 'project',
          driveAlias: project.path,
          quota: { remaining: 1, state: 'normal', total: 2, used: 1 }
        })
      })
      return projects
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
  .tile-preview,
  .tile-default-image > svg {
    filter: grayscale(100%);
    opacity: 80%;
  }
}
</style>
