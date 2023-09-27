<template>
  <div>
    <app-template
      ref="template"
      :loading="loadResourcesTask.isRunning || !loadResourcesTask.last"
      :breadcrumbs="breadcrumbs"
      :side-bar-active-panel="sideBarActivePanel"
      :side-bar-available-panels="sideBarAvailablePanels"
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
import { NoContentMessage } from '@ownclouders/web-pkg'
import {
  queryItemAsString,
  useAccessToken,
  useCapabilitySpacesMaxQuota,
  useClientService,
  useRouteQuery,
  useStore
} from '@ownclouders/web-pkg'
import { computed, defineComponent, onBeforeUnmount, onMounted, ref, unref } from 'vue'
import { useTask } from 'vue-concurrency'
import { eventBus } from '@ownclouders/web-pkg'
import AppTemplate from '../components/AppTemplate.vue'
import { buildSpace } from 'web-client/src/helpers'
import { configurationManager } from '@ownclouders/web-pkg'
import SpacesList from '../components/Spaces/SpacesList.vue'
import { SpaceDetails } from '@ownclouders/web-pkg'
import { SpaceDetailsMultiple } from '@ownclouders/web-pkg'
import { SpaceNoSelection } from '@ownclouders/web-pkg'
import ContextActions from '../components/Spaces/ContextActions.vue'
import MembersPanel from '../components/Spaces/SideBar/MembersPanel.vue'
import { SpaceInfo } from '@ownclouders/web-pkg'
import ActionsPanel from '../components/Spaces/SideBar/ActionsPanel.vue'
import { QuotaModal } from '@ownclouders/web-pkg'
import { useSideBar } from '@ownclouders/web-pkg'
import { useGettext } from 'vue3-gettext'
import {
  useSpaceActionsDelete,
  useSpaceActionsDisable,
  useSpaceActionsRestore,
  useSpaceActionsEditQuota
} from '@ownclouders/web-pkg'
import { SpaceAction } from '@ownclouders/web-pkg'

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

    const sideBarAvailablePanels = computed(() => {
      return [
        {
          app: 'SpaceNoSelection',
          icon: 'layout-grid',
          title: $gettext('Details'),
          component: SpaceNoSelection,
          default: true,
          enabled: unref(selectedSpaces).length === 0
        },
        {
          app: 'SpaceDetails',
          icon: 'layout-grid',
          title: $gettext('Details'),
          component: SpaceDetails,
          default: true,
          enabled: unref(selectedSpaces).length === 1,
          componentAttrs: {
            showSpaceImage: false,
            showSpaceId: true,
            showShareIndicators: false
          }
        },
        {
          app: 'SpaceDetailsMultiple',
          icon: 'layout-grid',
          title: $gettext('Details'),
          component: SpaceDetailsMultiple,
          default: true,
          enabled: unref(selectedSpaces).length > 1,
          componentAttrs: {
            selectedSpaces: unref(selectedSpaces)
          }
        },
        {
          app: 'SpaceActions',
          icon: 'slideshow-3',
          title: $gettext('Actions'),
          component: ActionsPanel,
          default: false,
          enabled: unref(selectedSpaces).length === 1
        },
        {
          app: 'SpaceMembers',
          icon: 'group',
          title: $gettext('Members'),
          component: MembersPanel,
          default: false,
          enabled: unref(selectedSpaces).length === 1
        }
      ].filter((p) => p.enabled)
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
