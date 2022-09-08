<template>
  <div class="oc-flex">
    <files-view-wrapper>
      <app-bar :side-bar-open="sideBarOpen" />
      <app-loading-spinner v-if="areResourcesLoading" />
      <template v-else>
        <no-content-message
          v-if="isEmpty"
          id="files-favorites-empty"
          class="files-empty"
          icon="star"
        >
          <template #message>
            <span v-translate>There are no resources marked as favorite</span>
          </template>
        </no-content-message>
        <resource-table
          v-else
          id="files-favorites-table"
          v-model="selectedResourcesIds"
          class="files-table"
          :class="{ 'files-table-squashed': sideBarOpen }"
          :are-paths-displayed="true"
          :are-thumbnails-displayed="displayThumbnails"
          :resources="paginatedResources"
          :target-route="resourceTargetLocation"
          :header-position="fileListHeaderY"
          :sort-by="sortBy"
          :sort-dir="sortDir"
          @fileClick="$_fileActions_triggerDefaultAction"
          @rowMounted="rowMounted"
          @sort="handleSort"
        >
          <template #quickActions="props">
            <quick-actions
              class="oc-visible@s"
              :item="props.resource"
              :actions="app.quickActions"
            />
          </template>
          <template #contextMenu="{ resource }">
            <context-actions v-if="isResourceInSelection(resource)" :items="selectedResources" />
          </template>
          <template #footer>
            <pagination :pages="paginationPages" :current-page="paginationPage" />
            <list-info
              v-if="paginatedResources.length > 0"
              class="oc-width-1-1 oc-my-s"
              :files="totalFilesCount.files"
              :folders="totalFilesCount.folders"
              :size="totalFilesSize"
            />
          </template>
        </resource-table>
      </template>
    </files-view-wrapper>
    <side-bar :open="sideBarOpen" :active-panel="sideBarActivePanel" />
  </div>
</template>

<script lang="ts">
import { mapGetters, mapState, mapActions } from 'vuex'
import ResourceTable from '../components/FilesList/ResourceTable.vue'

import FileActions from '../mixins/fileActions'
import MixinFilesListFilter from '../mixins/filesListFilter'
import { VisibilityObserver } from 'web-pkg/src/observer'
import { ImageDimension, ImageType } from '../constants'
import debounce from 'lodash-es/debounce'

import AppBar from '../components/AppBar/AppBar.vue'
import QuickActions from '../components/FilesList/QuickActions.vue'
import AppLoadingSpinner from 'web-pkg/src/components/AppLoadingSpinner.vue'
import NoContentMessage from 'web-pkg/src/components/NoContentMessage.vue'
import ListInfo from '../components/FilesList/ListInfo.vue'
import Pagination from '../components/FilesList/Pagination.vue'
import ContextActions from '../components/FilesList/ContextActions.vue'
import { createLocationSpaces } from '../router'
import { useResourcesViewDefaults } from '../composables'
import { defineComponent } from '@vue/composition-api'
import { Resource } from 'web-client'
import { useStore } from 'web-pkg/src/composables'
import SideBar from '../components/SideBar/SideBar.vue'
import FilesViewWrapper from '../components/FilesViewWrapper.vue'

const visibilityObserver = new VisibilityObserver()

export default defineComponent({
  components: {
    FilesViewWrapper,
    AppBar,
    ResourceTable,
    QuickActions,
    AppLoadingSpinner,
    Pagination,
    NoContentMessage,
    ListInfo,
    ContextActions,
    SideBar
  },

  mixins: [FileActions, MixinFilesListFilter],

  setup() {
    const store = useStore()
    return {
      ...useResourcesViewDefaults<Resource, any, any[]>(),
      resourceTargetLocation: createLocationSpaces('files-spaces-personal', {
        params: { storageId: store.getters.user.id }
      })
    }
  },

  computed: {
    ...mapState(['app']),
    ...mapState('Files', ['files']),
    ...mapGetters('Files', ['highlightedFile', 'totalFilesCount', 'totalFilesSize']),
    ...mapGetters(['user', 'configuration']),

    isEmpty() {
      return this.paginatedResources.length < 1
    },

    displayThumbnails() {
      return !this.configuration?.options?.disablePreviews
    }
  },

  created() {
    this.loadResourcesTask.perform()
  },

  beforeDestroy() {
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
