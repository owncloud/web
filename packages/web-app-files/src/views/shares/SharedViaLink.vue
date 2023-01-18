<template>
  <div class="oc-flex">
    <files-view-wrapper>
      <app-bar :has-shares-navigation="true" :side-bar-open="sideBarOpen" />
      <app-loading-spinner v-if="areResourcesLoading" />
      <template v-else>
        <no-content-message
          v-if="isEmpty"
          id="files-shared-via-link-empty"
          class="files-empty"
          icon="link"
        >
          <template #message>
            <span v-translate>There are no resources with a public link at the moment</span>
          </template>
        </no-content-message>
        <resource-table
          v-else
          id="files-shared-via-link-table"
          v-model:selectedIds="selectedResourcesIds"
          class="files-table"
          :class="{ 'files-table-squashed': sideBarOpen }"
          :fields-displayed="['name', 'sharedWith', 'sdate']"
          :are-thumbnails-displayed="displayThumbnails"
          :are-paths-displayed="true"
          :resources="paginatedResources"
          :header-position="fileListHeaderY"
          :target-route-callback="resourceTargetRouteCallback"
          :sort-by="sortBy"
          :sort-dir="sortDir"
          @file-click="$_fileActions_triggerDefaultAction"
          @row-mounted="rowMounted"
          @sort="handleSort"
        >
          <template #contextMenu="{ resource }">
            <context-actions
              v-if="isResourceInSelection(resource)"
              :items="selectedResources"
              :space="getSpace(resource)"
            />
          </template>
          <template #footer>
            <pagination :pages="paginationPages" :current-page="paginationPage" />
            <list-info
              v-if="paginatedResources.length > 0"
              class="oc-width-1-1 oc-my-s"
              :files="totalFilesCount.files"
              :folders="totalFilesCount.folders"
              :spaces="totalFilesCount.spaces"
              :show-spaces="hasProjectSpaces"
            />
          </template>
        </resource-table>
      </template>
    </files-view-wrapper>
    <side-bar
      :open="sideBarOpen"
      :active-panel="sideBarActivePanel"
      :space="selectedResourceSpace"
    />
  </div>
</template>

<script lang="ts">
import { mapGetters, mapState, mapActions } from 'vuex'

import FileActions from '../../mixins/fileActions'
import { VisibilityObserver } from 'web-pkg/src/observer'
import { ImageDimension, ImageType } from 'web-pkg/src/constants'
import { debounce } from 'lodash-es'

import AppLoadingSpinner from 'web-pkg/src/components/AppLoadingSpinner.vue'
import NoContentMessage from 'web-pkg/src/components/NoContentMessage.vue'
import AppBar from '../../components/AppBar/AppBar.vue'
import ListInfo from '../../components/FilesList/ListInfo.vue'
import Pagination from '../../components/FilesList/Pagination.vue'
import ContextActions from '../../components/FilesList/ContextActions.vue'
import SideBar from '../../components/SideBar/SideBar.vue'
import FilesViewWrapper from '../../components/FilesViewWrapper.vue'
import ResourceTable from '../../components/FilesList/ResourceTable.vue'

import { useResourcesViewDefaults } from '../../composables'
import { defineComponent, unref  } from 'vue'
import { Resource } from 'web-client'
import { useCapabilityShareJailEnabled, useCapabilityProjectSpacesEnabled, useStore } from 'web-pkg/src/composables'
import { buildShareSpaceResource, SpaceResource } from 'web-client/src/helpers'
import { configurationManager } from 'web-pkg/src/configuration'
import { CreateTargetRouteOptions } from 'web-app-files/src/helpers/folderLink'
import { createLocationSpaces } from 'web-app-files/src/router'
import { createFileRouteOptions } from 'web-pkg/src/helpers/router'
import { Location } from 'vue-router'

const visibilityObserver = new VisibilityObserver()

export default defineComponent({
  components: {
    FilesViewWrapper,
    AppBar,
    ResourceTable,
    AppLoadingSpinner,
    NoContentMessage,
    ListInfo,
    Pagination,
    ContextActions,
    SideBar
  },

  mixins: [FileActions],

  setup() {
    const store = useStore()
    const hasShareJail = useCapabilityShareJailEnabled()
    const getSpace = (resource: Resource): SpaceResource => {
      const storageId = resource.storageId
      // FIXME: Once we have the shareId in the OCS response, we can check for that and early return the share
      const space = store.getters['runtime/spaces/spaces'].find((space) => space.id === storageId)
      if (space) {
        return space
      }

      return buildShareSpaceResource({
        shareId: resource.shareId,
        shareName: resource.name,
        serverUrl: configurationManager.serverUrl
      })
    }

    const resourceTargetRouteCallback = ({
      path,
      fileId,
      resource
    }: CreateTargetRouteOptions): Location => {
      if (unref(hasShareJail)) {
        const space = buildShareSpaceResource({
          shareId: resource.id,
          shareName: resource.name,
          serverUrl: configurationManager.serverUrl
        })
        return createLocationSpaces(
          'files-spaces-generic',
          createFileRouteOptions(space, { path, fileId })
        )
      }
      const personalSpace = store.getters['runtime/spaces/spaces'].find(
        (space) => space.driveType === 'personal'
      )
      return createLocationSpaces(
        'files-spaces-generic',
        createFileRouteOptions(personalSpace, { path, fileId })
      )
    }

    return {
      resourceTargetRouteCallback,
      ...useResourcesViewDefaults<Resource, any, any[]>(),
      getSpace,
      hasProjectSpaces: useCapabilityProjectSpacesEnabled()
    }
  },

  computed: {
    ...mapState(['app']),
    ...mapGetters('Files', ['totalFilesCount']),
    ...mapGetters(['configuration']),

    helpersEnabled() {
      return this.configuration?.options?.contextHelpers
    },

    isEmpty() {
      return this.paginatedResources.length < 1
    },

    displayThumbnails() {
      return !this.configuration?.options?.disablePreviews
    }
  },

  async created() {
    await this.loadResourcesTask.perform()
    this.scrollToResourceFromRoute(this.paginatedResources)
  },

  beforeUnmount() {
    visibilityObserver.disconnect()
  },

  methods: {
    ...mapActions('Files', ['loadPreview']),

    rowMounted(resource, component) {
      if (!this.displayThumbnails) {
        return
      }

      const debounced = debounce(({ unobserve }) => {
        unobserve()
        this.loadPreview({
          resource,
          isPublic: false,
          dimensions: ImageDimension.Thumbnail,
          type: ImageType.Thumbnail
        })
      }, 250)

      visibilityObserver.observe(component.$el, { onEnter: debounced, onExit: debounced.cancel })
    }
  }
})
</script>
