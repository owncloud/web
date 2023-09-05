<template>
  <div class="oc-flex oc-width-1-1">
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
        :view-mode-default="ViewModeConstants.tilesView.name"
      >
        <template #actions>
          <create-space v-if="hasCreatePermission" class="oc-mr-s" />
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
        <div v-else ref="tilesTableRef" class="spaces-list oc-mt-l">
          <oc-text-input
            id="spaces-filter"
            v-model="filterTerm"
            class="oc-ml-m oc-my-m"
            :label="$gettext('Search')"
            autocomplete="off"
          />
          <resource-tiles
            v-if="viewMode === ViewModeConstants.tilesView.name"
            v-model:selectedIds="selectedResourcesIds"
            class="oc-px-m"
            :data="paginatedItems"
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
                @click="openSidebarSharePanel(resource as SpaceResource)"
              >
                <oc-icon name="group" fill-type="line" />
              </oc-button>
            </template>
            <template #contextMenuActions="{ resource }">
              <space-context-actions
                :action-options="{ resources: [resource] as SpaceResource[] }"
              />
            </template>
            <template #footer>
              <pagination :pages="totalPages" :current-page="currentPage" />
              <div class="oc-text-nowrap oc-text-center oc-width-1-1 oc-my-s">
                <p class="oc-text-muted">{{ footerTextTotal }}</p>
                <p v-if="filterTerm" class="oc-text-muted">{{ footerTextFilter }}</p>
              </div>
            </template>
          </resource-tiles>
          <resource-table
            v-else
            v-model:selectedIds="selectedResourcesIds"
            :resources="paginatedItems"
            class="spaces-table"
            :class="{ 'spaces-table-squashed': sideBarOpen }"
            :sticky="false"
            :fields-displayed="tableDisplayFields"
            :are-thumbnails-displayed="true"
            :sort-fields="sortFields"
            :sort-by="sortBy"
            :sort-dir="sortDir"
            @sort="handleSort"
          >
            <template #contextMenu="{ resource }">
              <space-context-actions
                :action-options="{ resources: [resource] as SpaceResource[] }"
              />
            </template>
            <template #status="{ resource }">
              <span v-if="resource.disabled" class="oc-flex oc-flex-middle">
                <oc-icon name="stop-circle" fill-type="line" class="oc-mr-s" /><span
                  v-text="$gettext('Disabled')"
                />
              </span>
              <span v-else class="oc-flex oc-flex-middle">
                <oc-icon name="play-circle" fill-type="line" class="oc-mr-s" /><span
                  v-text="$gettext('Enabled')"
                />
              </span>
            </template>
            <template #manager="{ resource }">
              {{ getManagerNames(resource) }}
            </template>
            <template #members="{ resource }">
              {{ getMemberCount(resource) }}
            </template>
            <template #totalQuota="{ resource }">
              {{ getTotalQuota(resource) }}
            </template>
            <template #usedQuota="{ resource }"> {{ getUsedQuota(resource) }} </template>
            <template #remainingQuota="{ resource }"> {{ getRemainingQuota(resource) }} </template>
            <template #image="{ resource }">
              <img
                v-if="imageContentObject[resource.id]"
                class="table-preview oc-mr-s"
                :src="imageContentObject[resource.id]['data']"
                alt=""
                width="33"
                height="33"
              />
              <oc-resource-icon v-else class="oc-mr-s" :resource="resource" />
            </template>
            <template #footer>
              <pagination :pages="totalPages" :current-page="currentPage" />
              <div class="oc-text-nowrap oc-text-center oc-width-1-1 oc-my-s">
                <p class="oc-text-muted">{{ footerTextTotal }}</p>
                <p v-if="filterTerm" class="oc-text-muted">{{ footerTextFilter }}</p>
              </div>
            </template>
          </resource-table>
        </div>
      </template>
    </files-view-wrapper>
    <side-bar :open="sideBarOpen" :active-panel="sideBarActivePanel" :space="highlightedFile" />
  </div>
</template>

<script lang="ts">
import { onMounted, computed, defineComponent, unref, ref, watch, nextTick } from 'vue'
import { useTask } from 'vue-concurrency'
import { mapMutations, mapGetters } from 'vuex'
import Mark from 'mark.js'
import Fuse from 'fuse.js'

import NoContentMessage from 'web-pkg/src/components/NoContentMessage.vue'
import AppLoadingSpinner from 'web-pkg/src/components/AppLoadingSpinner.vue'

import AppBar from '../../components/AppBar/AppBar.vue'
import CreateSpace from '../../components/AppBar/CreateSpace.vue'
import {
  useAbility,
  useClientService,
  ViewModeConstants,
  useRouteQueryPersisted,
  useSort,
  useStore,
  useRouteName,
  SortDir,
  usePagination,
  useRouter,
  useRoute
} from 'web-pkg/src/composables'
import { ImageDimension } from 'web-pkg/src/constants'
import Pagination from 'web-pkg/src/components/Pagination.vue'
import SpaceContextActions from '../../components/Spaces/SpaceContextActions.vue'
import { isProjectSpaceResource, Resource, SpaceResource } from 'web-client/src/helpers'
import SideBar from '../../components/SideBar/SideBar.vue'
import FilesViewWrapper from '../../components/FilesViewWrapper.vue'
import ResourceTiles from '../../components/FilesList/ResourceTiles.vue'
import ResourceTable from '../../components/FilesList/ResourceTable.vue'
import { eventBus } from 'web-pkg/src/services/eventBus'
import { SideBarEventTopics, useSideBar } from 'web-pkg/src/composables/sideBar'
import { WebDAV } from 'web-client/src/webdav'
import { useScrollTo } from 'web-app-files/src/composables/scrollTo'
import { useSelectedResources } from 'web-app-files/src/composables'
import { sortFields as availableSortFields } from '../../helpers/ui/resourceTiles'
import { defaultFuseOptions, formatFileSize } from 'web-pkg/src'
import { useGettext } from 'vue3-gettext'
import { spaceRoleEditor, spaceRoleManager, spaceRoleViewer } from 'web-client/src/helpers/share'
import { useKeyboardActions } from 'web-pkg/src/composables/keyboardActions'
import {
  useKeyboardTableNavigation,
  useKeyboardTableMouseActions,
  useKeyboardTableActions
} from 'web-app-files/src/composables/keyboardActions'
import { orderBy } from 'lodash-es'

export default defineComponent({
  components: {
    AppBar,
    AppLoadingSpinner,
    CreateSpace,
    FilesViewWrapper,
    NoContentMessage,
    Pagination,
    ResourceTiles,
    ResourceTable,
    SideBar,
    SpaceContextActions
  },
  setup() {
    const store = useStore()
    const router = useRouter()
    const route = useRoute()
    const clientService = useClientService()
    const { selectedResourcesIds } = useSelectedResources({ store })
    const { can } = useAbility()
    const { current: currentLanguage, $gettext } = useGettext()
    const filterTerm = ref('')
    const markInstance = ref(undefined)
    const tilesTableRef = ref(undefined)

    const runtimeSpaces = computed((): SpaceResource[] => {
      return store.getters['runtime/spaces/spaces'].filter((s) => isProjectSpaceResource(s)) || []
    })

    const tableDisplayFields = [
      'image',
      'name',
      'manager',
      'members',
      'totalQuota',
      'usedQuota',
      'remainingQuota',
      'status',
      'mdate'
    ]

    const sortFields = availableSortFields
    const {
      sortBy,
      sortDir,
      items: spaces,
      handleSort
    } = useSort<SpaceResource>({
      items: runtimeSpaces,
      fields: sortFields
    })
    const filter = (spaces: Array<Resource>, filterTerm: string) => {
      if (!(filterTerm || '').trim()) {
        return spaces
      }
      const searchEngine = new Fuse(spaces, { ...defaultFuseOptions, keys: ['name'] })
      return searchEngine.search(filterTerm).map((r) => r.item)
    }
    const items = computed(() =>
      orderBy(
        filter(unref(spaces), unref(filterTerm)),
        unref(sortBy),
        unref(sortDir) === SortDir.Desc
      )
    )

    const {
      items: paginatedItems,
      page: currentPage,
      total: totalPages
    } = usePagination({
      items,
      perPageDefault: '50',
      perPageStoragePrefix: 'spaces-list'
    })

    watch(filterTerm, async () => {
      const instance = unref(markInstance)
      if (!instance) {
        return
      }
      await router.push({ ...unref(route), query: { ...unref(route).query, page: '1' } })
      instance.unmark()
      instance.mark(unref(filterTerm), {
        element: 'span',
        className: 'highlight-mark',
        exclude: ['th *', 'tfoot *']
      })
    })

    const { scrollToResourceFromRoute } = useScrollTo()

    const loadResourcesTask = useTask(function* () {
      store.commit('Files/CLEAR_FILES_SEARCHED')
      store.commit('Files/CLEAR_CURRENT_FILES_LIST')
      yield store.dispatch('runtime/spaces/reloadProjectSpaces', {
        graphClient: clientService.graphAuthenticated
      })
      store.commit('Files/LOAD_FILES', { currentFolder: null, files: unref(spaces) })
    })

    const areResourcesLoading = computed(() => {
      return loadResourcesTask.isRunning || !loadResourcesTask.last
    })

    const hasCreatePermission = computed(() => can('create-all', 'Drive'))
    const viewModes = computed(() => [ViewModeConstants.default, ViewModeConstants.tilesView])

    const routeName = useRouteName()

    const viewMode = useRouteQueryPersisted({
      name: `${unref(routeName)}-${ViewModeConstants.queryName}`,
      defaultValue: ViewModeConstants.tilesView.name
    })

    const keyActions = useKeyboardActions()
    useKeyboardTableNavigation(keyActions, runtimeSpaces, viewMode)
    useKeyboardTableMouseActions(keyActions, viewMode)
    useKeyboardTableActions(keyActions)

    const getManagerNames = (space: SpaceResource) => {
      const allManagers = space.spaceRoles[spaceRoleManager.name]
      const managers = allManagers.length > 2 ? allManagers.slice(0, 2) : allManagers
      let managerStr = managers.map((m) => m.displayName).join(', ')
      if (allManagers.length > 2) {
        managerStr += `... +${allManagers.length - 2}`
      }
      return managerStr
    }

    const getTotalQuota = (space: SpaceResource) => {
      if (space.spaceQuota.total === 0) {
        return $gettext('Unrestricted')
      }

      return formatFileSize(space.spaceQuota.total, currentLanguage)
    }
    const getUsedQuota = (space: SpaceResource) => {
      if (space.spaceQuota.used === undefined) {
        return '-'
      }
      return formatFileSize(space.spaceQuota.used, currentLanguage)
    }
    const getRemainingQuota = (space: SpaceResource) => {
      if (space.spaceQuota.remaining === undefined) {
        return '-'
      }
      return formatFileSize(space.spaceQuota.remaining, currentLanguage)
    }
    const getMemberCount = (space: SpaceResource) => {
      return (
        space.spaceRoles[spaceRoleManager.name].length +
        space.spaceRoles[spaceRoleEditor.name].length +
        space.spaceRoles[spaceRoleViewer.name].length
      )
    }

    onMounted(async () => {
      await loadResourcesTask.perform()
      scrollToResourceFromRoute(unref(spaces))
      nextTick(() => {
        markInstance.value = new Mark('.spaces-table')
      })
    })

    const footerTextTotal = computed(() => {
      return $gettext('%{spaceCount} spaces in total', {
        spaceCount: unref(spaces).length.toString()
      })
    })
    const footerTextFilter = computed(() => {
      return $gettext('%{spaceCount} matching spaces', {
        spaceCount: unref(items).length.toString()
      })
    })

    return {
      ...useSideBar(),
      spaces,
      clientService,
      loadResourcesTask,
      areResourcesLoading,
      selectedResourcesIds,
      handleSort,
      sortBy,
      sortDir,
      sortFields,
      hasCreatePermission,
      viewModes,
      viewMode,
      tableDisplayFields,
      ViewModeConstants,
      getManagerNames,
      getTotalQuota,
      getUsedQuota,
      getRemainingQuota,
      getMemberCount,
      paginatedItems,
      filterTerm,
      tilesTableRef,
      totalPages,
      currentPage,
      footerTextTotal,
      footerTextFilter,
      items
    }
  },
  data: function () {
    return {
      imageContentObject: {}
    }
  },
  computed: {
    ...mapGetters('Files', ['highlightedFile']),
    breadcrumbs() {
      return [
        {
          text: this.$gettext('Spaces'),
          onClick: () => this.loadResourcesTask.perform(),
          isStativNav: true
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
          this.$previewService
            .loadPreview({ space, resource, dimensions: ImageDimension.Tile })
            .then((imageBlob) => {
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
.table-preview {
  border-radius: 3px;
}
.state-trashed {
  .tile-preview,
  .tile-default-image > svg {
    filter: grayscale(100%);
    opacity: 80%;
  }
}
</style>
