<template>
  <div class="oc-flex">
    <files-view-wrapper>
      <app-bar :view-modes="viewModes" :side-bar-open="sideBarOpen" />
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
          v-model:selectedIds="selectedResourcesIds"
          class="files-table"
          :class="{ 'files-table-squashed': sideBarOpen }"
          :are-paths-displayed="true"
          :are-thumbnails-displayed="displayThumbnails"
          :resources="paginatedResources"
          :header-position="fileListHeaderY"
          :sort-by="sortBy"
          :sort-dir="sortDir"
          @file-click="triggerDefaultAction"
          @row-mounted="rowMounted"
          @sort="handleSort"
        >
          <template #quickActions="props">
            <quick-actions class="oc-visible@s" :item="props.resource" />
          </template>
          <template #contextMenu="{ resource }">
            <context-actions
              v-if="isResourceInSelection(resource)"
              :action-options="{ space: getMatchingSpace(resource), resources: selectedResources }"
            />
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
    <file-side-bar
      :open="sideBarOpen"
      :active-panel="sideBarActivePanel"
      :space="selectedResourceSpace"
    />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onBeforeUnmount, onMounted, ref } from 'vue'
import { mapGetters, mapState, mapActions } from 'vuex'
import { debounce } from 'lodash-es'

import { Resource } from '@ownclouders/web-client'
import { VisibilityObserver } from '@ownclouders/web-pkg'
import { ImageDimension, ImageType } from '@ownclouders/web-pkg'
import { AppLoadingSpinner } from '@ownclouders/web-pkg'
import { FileSideBar, NoContentMessage } from '@ownclouders/web-pkg'
import { Pagination } from '@ownclouders/web-pkg'
import { eventBus } from '@ownclouders/web-pkg'
import { useGetMatchingSpace, useStore, ViewModeConstants } from '@ownclouders/web-pkg'

import { AppBar } from '@ownclouders/web-pkg'
import QuickActions from '../components/FilesList/QuickActions.vue'
import ListInfo from '../components/FilesList/ListInfo.vue'
import { ContextActions } from '@ownclouders/web-pkg'
import { ResourceTable } from '@ownclouders/web-pkg'
import FilesViewWrapper from '../components/FilesViewWrapper.vue'
import { useResourcesViewDefaults } from '../composables'
import { useFileActions } from '@ownclouders/web-pkg'

const visibilityObserver = new VisibilityObserver()

export default defineComponent({
  components: {
    FilesViewWrapper,
    AppBar,
    FileSideBar,
    ResourceTable,
    QuickActions,
    AppLoadingSpinner,
    Pagination,
    NoContentMessage,
    ListInfo,
    ContextActions
  },

  setup() {
    const store = useStore()
    const { getMatchingSpace } = useGetMatchingSpace()

    const viewModes = computed(() => [
      ViewModeConstants.condensedTable,
      ViewModeConstants.default,
      ViewModeConstants.tilesView
    ])

    const loadResourcesEventToken = ref(null)

    onMounted(() => {
      loadResourcesEventToken.value = eventBus.subscribe(
        'app.files.list.removeFromFavorites',
        (resourceId: string) => {
          store.commit('Files/REMOVE_FILES', [{ id: resourceId }])
        }
      )
    })

    onBeforeUnmount(() => {
      visibilityObserver.disconnect()
      eventBus.unsubscribe('app.files.list.removeFromFavorites', loadResourcesEventToken)
    })

    return {
      ...useFileActions(),
      ...useResourcesViewDefaults<Resource, any, any[]>(),
      getMatchingSpace,
      viewModes
    }
  },

  computed: {
    ...mapState(['app']),
    ...mapState('Files', ['files']),
    ...mapGetters('Files', ['totalFilesCount', 'totalFilesSize']),
    ...mapGetters(['user', 'configuration']),

    isEmpty() {
      return this.paginatedResources.length < 1
    },

    displayThumbnails() {
      return !this.configuration?.options?.disablePreviews
    }
  },

  async created() {
    await this.loadResourcesTask.perform()
    this.scrollToResourceFromRoute(this.paginatedResources, 'files-app-bar')
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
          previewService: this.$previewService,
          space: this.getMatchingSpace(resource),
          resource,
          dimensions: ImageDimension.Thumbnail,
          type: ImageType.Thumbnail
        })
      }, 250)

      visibilityObserver.observe(component.$el, { onEnter: debounced, onExit: debounced.cancel })
    }
  }
})
</script>
