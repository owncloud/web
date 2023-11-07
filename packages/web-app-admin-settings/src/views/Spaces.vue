<template>
  <div>
    <app-template
      ref="template"
      :loading="loadResourcesTask.isRunning || !loadResourcesTask.last"
      :breadcrumbs="breadcrumbs"
      :side-bar-active-panel="sideBarActivePanel"
      :side-bar-available-panels="sideBarAvailablePanels"
      :side-bar-panel-context="sideBarPanelContext"
      :side-bar-open="sideBarOpen"
      :is-side-bar-header-compact="selectedSpaces.length === 1"
      :show-batch-actions="!!selectedSpaces.length"
      :batch-actions="batchActions"
      :batch-action-items="selectedSpaces"
      :show-view-options="true"
    >
      <template #sideBarHeader>
        <space-info
          v-if="selectedSpaces.length === 1"
          :space-resource="selectedSpaces[0]"
          class="sidebar-panel__space_info"
        />
      </template>
      <template #mainContent>
        <quota-modal
          v-if="quotaModalIsOpen"
          :cancel="closeQuotaModal"
          :spaces="selectedSpaces"
          :max-quota="maxQuota"
        />
        <no-content-message
          v-if="!spaces.length"
          id="admin-settings-spaces-empty"
          class="spaces-empty"
          icon="layout-grid"
        >
          <template #message>
            <span v-translate>No spaces in here</span>
          </template>
        </no-content-message>
        <div v-else>
          <SpacesList
            :spaces="spaces"
            :class="{ 'spaces-table-squashed': sideBarOpen }"
            :selected-spaces="selectedSpaces"
            @toggle-select-space="toggleSelectSpace"
            @select-spaces="selectSpaces"
            @un-select-all-spaces="unselectAllSpaces"
          >
            <template #contextMenu>
              <context-actions :items="selectedSpaces" />
            </template>
          </SpacesList>
        </div>
      </template>
    </app-template>
  </div>
</template>

<script lang="ts">
import AppTemplate from '../components/AppTemplate.vue'
import SpacesList from '../components/Spaces/SpacesList.vue'
import ContextActions from '../components/Spaces/ContextActions.vue'
import MembersPanel from '../components/Spaces/SideBar/MembersPanel.vue'
import ActionsPanel from '../components/Spaces/SideBar/ActionsPanel.vue'
import {
  NoContentMessage,
  QuotaModal,
  SideBarPanel,
  SideBarPanelContext,
  SpaceAction,
  SpaceDetails,
  SpaceDetailsMultiple,
  SpaceInfo,
  SpaceNoSelection,
  eventBus,
  configurationManager,
  queryItemAsString,
  useAccessToken,
  useCapabilitySpacesMaxQuota,
  useClientService,
  useRouteQuery,
  useSideBar,
  useSpaceActionsDelete,
  useSpaceActionsDisable,
  useSpaceActionsRestore,
  useSpaceActionsEditQuota,
  useStore
} from '@ownclouders/web-pkg'
import { buildSpace, SpaceResource } from '@ownclouders/web-client/src/helpers'
import { computed, defineComponent, onBeforeUnmount, onMounted, ref, unref } from 'vue'
import { useTask } from 'vue-concurrency'
import { useGettext } from 'vue3-gettext'

export default defineComponent({
  name: 'SpacesView',
  components: {
    SpacesList,
    AppTemplate,
    NoContentMessage,
    ContextActions,
    SpaceInfo,
    QuotaModal
  },
  provide() {
    return {
      resource: computed(() => this.selectedSpaces[0])
    }
  },
  setup() {
    const store = useStore()
    const accessToken = useAccessToken({ store })
    const spaces = ref([])
    const clientService = useClientService()
    const { $gettext } = useGettext()
    const { sideBarOpen, sideBarActivePanel } = useSideBar()

    const loadResourcesEventToken = ref(null)
    let updateQuotaForSpaceEventToken
    const template = ref(null)
    const selectedSpaces = ref([])

    const currentPageQuery = useRouteQuery('page', '1')
    const currentPage = computed(() => {
      return parseInt(queryItemAsString(unref(currentPageQuery)))
    })

    const itemsPerPageQuery = useRouteQuery('admin-settings-items-per-page', '1')
    const itemsPerPage = computed(() => {
      return parseInt(queryItemAsString(unref(itemsPerPageQuery)))
    })

    const loadResourcesTask = useTask(function* (signal) {
      const {
        data: { value: drivesResponse }
      } = yield clientService.graphAuthenticated.drives.listAllDrives(
        'name asc',
        'driveType eq project'
      )
      const drives = drivesResponse.map((space) =>
        buildSpace({ ...space, serverUrl: configurationManager.serverUrl })
      )
      spaces.value = drives
    })

    const breadcrumbs = computed(() => [
      { text: $gettext('Administration Settings'), to: { path: '/admin-settings' } },
      {
        text: $gettext('Spaces'),
        onClick: () => eventBus.publish('app.admin-settings.list.load')
      }
    ])

    const selectSpaces = (paginatedSpaces) => {
      selectedSpaces.value.splice(0, selectedSpaces.value.length, ...paginatedSpaces)
    }

    const toggleSelectSpace = (toggledSpace, deselect = false) => {
      if (deselect) {
        selectedSpaces.value.splice(0, selectedSpaces.value.length)
      }
      const isSpaceSelected = unref(selectedSpaces).find((s) => s.id === toggledSpace.id)
      if (!isSpaceSelected) {
        return selectedSpaces.value.push(toggledSpace)
      }

      const index = selectedSpaces.value.findIndex((s) => s.id === toggledSpace.id)
      selectedSpaces.value.splice(index, 1)
    }

    const unselectAllSpaces = () => {
      selectedSpaces.value.splice(0, selectedSpaces.value.length)
    }

    const { actions: deleteActions } = useSpaceActionsDelete({ store })
    const { actions: disableActions } = useSpaceActionsDisable({ store })
    const {
      actions: editQuotaActions,
      modalOpen: quotaModalIsOpen,
      closeModal: closeQuotaModal
    } = useSpaceActionsEditQuota({ store })
    const { actions: restoreActions } = useSpaceActionsRestore({ store })

    const batchActions = computed((): SpaceAction[] => {
      return [
        ...unref(editQuotaActions),
        ...unref(restoreActions),
        ...unref(deleteActions),
        ...unref(disableActions)
      ].filter((item) => item.isEnabled({ resources: unref(selectedSpaces) }))
    })

    const sideBarPanelContext = computed<SideBarPanelContext<any, SpaceResource>>(() => {
      return {
        parent: null,
        items: unref(selectedSpaces)
      }
    })
    const sideBarAvailablePanels = computed<SideBarPanel<any, SpaceResource>[]>(() => {
      return (
        [
          {
            name: 'SpaceNoSelection',
            icon: 'layout-grid',
            title: () => $gettext('Details'),
            component: SpaceNoSelection,
            isRoot: () => true,
            isEnabled: ({ items }) => items.length === 0
          },
          {
            name: 'SpaceDetails',
            icon: 'layout-grid',
            title: () => $gettext('Details'),
            component: SpaceDetails,
            componentAttrs: () => ({
              showSpaceImage: false,
              showShareIndicators: false
            }),
            isRoot: () => true,
            isEnabled: ({ items }) => items.length === 1
          },
          {
            name: 'SpaceDetailsMultiple',
            icon: 'layout-grid',
            title: () => $gettext('Details'),
            component: SpaceDetailsMultiple,
            componentAttrs: ({ items }) => ({
              selectedSpaces: items
            }),
            isRoot: () => true,
            isEnabled: ({ items }) => items.length > 1
          },
          {
            name: 'SpaceActions',
            icon: 'slideshow-3',
            title: () => $gettext('Actions'),
            component: ActionsPanel,
            isEnabled: ({ items }) => items.length === 1
          },
          {
            name: 'SpaceMembers',
            icon: 'group',
            title: () => $gettext('Members'),
            component: MembersPanel,
            isEnabled: ({ items }) => items.length === 1
          }
        ] satisfies SideBarPanel<any, SpaceResource>[]
      ).filter((p) => p.isEnabled(unref(sideBarPanelContext)))
    })

    onMounted(async () => {
      await loadResourcesTask.perform()
      loadResourcesEventToken.value = eventBus.subscribe(
        'app.admin-settings.list.load',
        async () => {
          await loadResourcesTask.perform()
          selectedSpaces.value = []

          const pageCount = Math.ceil(unref(spaces).length / unref(itemsPerPage))
          if (unref(currentPage) > 1 && unref(currentPage) > pageCount) {
            // reset pagination to avoid empty lists (happens when deleting all items on the last page)
            currentPageQuery.value = pageCount.toString()
          }
        }
      )

      updateQuotaForSpaceEventToken = eventBus.subscribe(
        'app.admin-settings.spaces.space.quota.updated',
        ({ spaceId, quota }) => {
          const space = unref(spaces).find((s) => s.id === spaceId)
          if (space) {
            space.spaceQuota = quota
          }
        }
      )
    })

    onBeforeUnmount(() => {
      eventBus.unsubscribe('app.admin-settings.list.load', unref(loadResourcesEventToken))
      eventBus.unsubscribe(
        'app.admin-settings.spaces.space.quota.updated',
        updateQuotaForSpaceEventToken
      )
    })

    return {
      maxQuota: useCapabilitySpacesMaxQuota(),
      sideBarOpen,
      sideBarActivePanel,
      spaces,
      loadResourcesTask,
      accessToken,
      breadcrumbs,
      batchActions,
      selectedSpaces,
      sideBarAvailablePanels,
      sideBarPanelContext,
      template,
      selectSpaces,
      toggleSelectSpace,
      unselectAllSpaces,
      quotaModalIsOpen,
      closeQuotaModal
    }
  }
})
</script>
