<template>
  <div class="oc-flex">
    <files-view-wrapper>
      <app-bar ref="appBarRef" :view-modes="viewModes" :is-side-bar-open="isSideBarOpen" />
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
        <component
          :is="folderView.component"
          v-else
          v-model:selectedIds="selectedResourcesIds"
          :is-side-bar-open="isSideBarOpen"
          :are-paths-displayed="true"
          :resources="paginatedResources"
          :header-position="fileListHeaderY"
          :sort-by="sortBy"
          :sort-dir="sortDir"
          :style="folderViewStyle"
          v-bind="folderView.componentAttrs?.()"
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
            <list-info v-if="paginatedResources.length > 0" class="oc-width-1-1 oc-my-s" />
          </template>
        </component>
      </template>
    </files-view-wrapper>
    <file-side-bar
      :is-open="isSideBarOpen"
      :active-panel="sideBarActivePanel"
      :space="selectedResourceSpace"
    />
  </div>
</template>

<script lang="ts">
import {
  ComponentPublicInstance,
  computed,
  defineComponent,
  onBeforeUnmount,
  onMounted,
  ref,
  unref
} from 'vue'
import { debounce } from 'lodash-es'

import { Resource } from '@ownclouders/web-client'
import {
  VisibilityObserver,
  useExtensionRegistry,
  useConfigStore,
  useResourcesStore
} from '@ownclouders/web-pkg'
import { ImageDimension } from '@ownclouders/web-pkg'

import { AppLoadingSpinner } from '@ownclouders/web-pkg'
import { FileSideBar, NoContentMessage } from '@ownclouders/web-pkg'
import { Pagination } from '@ownclouders/web-pkg'
import { eventBus } from '@ownclouders/web-pkg'
import { useGetMatchingSpace } from '@ownclouders/web-pkg'

import { AppBar } from '@ownclouders/web-pkg'
import QuickActions from '../components/FilesList/QuickActions.vue'
import ListInfo from '../components/FilesList/ListInfo.vue'
import { ContextActions } from '@ownclouders/web-pkg'
import { ResourceTable } from '@ownclouders/web-pkg'
import FilesViewWrapper from '../components/FilesViewWrapper.vue'
import { useResourcesViewDefaults } from '../composables'
import { useFileActions } from '@ownclouders/web-pkg'
import { storeToRefs } from 'pinia'
import { folderViewsFavoritesExtensionPoint } from '../extensionPoints'

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
    const { getMatchingSpace } = useGetMatchingSpace()
    const configStore = useConfigStore()
    const { options: configOptions } = storeToRefs(configStore)

    const resourcesStore = useResourcesStore()
    const { updateResourceField } = resourcesStore

    const resourcesViewDefaults = useResourcesViewDefaults<Resource, any, any[]>()

    const extensionRegistry = useExtensionRegistry()
    const viewModes = computed(() => {
      return [
        ...extensionRegistry
          .requestExtensions(folderViewsFavoritesExtensionPoint)
          .map((e) => e.folderView)
      ]
    })
    const folderView = computed(() => {
      const viewMode = unref(resourcesViewDefaults.viewMode)
      return unref(viewModes).find((v) => v.name === viewMode)
    })
    const appBarRef = ref<ComponentPublicInstance | null>()
    const folderViewStyle = computed(() => {
      return {
        ...(unref(folderView)?.isScrollable === false && {
          height: `calc(100% - ${unref(appBarRef)?.$el.getBoundingClientRect().height}px)`
        })
      }
    })
    const loadResourcesEventToken = ref(null)

    onMounted(() => {
      loadResourcesEventToken.value = eventBus.subscribe(
        'app.files.list.removeFromFavorites',
        (resourceId: string) => {
          resourcesStore.removeResources([{ id: resourceId }] as Resource[])
        }
      )
    })

    onBeforeUnmount(() => {
      visibilityObserver.disconnect()
      eventBus.unsubscribe('app.files.list.removeFromFavorites', unref(loadResourcesEventToken))
    })

    return {
      ...useFileActions(),
      ...resourcesViewDefaults,
      configOptions,
      getMatchingSpace,
      viewModes,
      updateResourceField,
      appBarRef,
      folderView,
      folderViewStyle
    }
  },

  computed: {
    isEmpty() {
      return this.paginatedResources.length < 1
    }
  },

  async created() {
    await this.loadResourcesTask.perform()
    this.scrollToResourceFromRoute(this.paginatedResources, 'files-app-bar')
  },

  methods: {
    rowMounted(resource: Resource, component: ComponentPublicInstance<unknown>) {
      const loadPreview = async () => {
        const preview = await this.$previewService.loadPreview(
          {
            space: this.getMatchingSpace(resource),
            resource,
            dimensions: ImageDimension.Thumbnail
          },
          true
        )
        if (preview) {
          this.updateResourceField({ id: resource.id, field: 'thumbnail', value: preview })
        }
      }

      const debounced = debounce(({ unobserve }) => {
        unobserve()
        loadPreview()
      }, 250)

      visibilityObserver.observe(component.$el, { onEnter: debounced, onExit: debounced.cancel })
    }
  }
})
</script>
