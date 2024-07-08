<template>
  <div>
    <app-template
      ref="template"
      :loading="loadResourcesTask.isRunning || !loadResourcesTask.last"
      :breadcrumbs="breadcrumbs"
      :side-bar-active-panel="sideBarActivePanel"
      :side-bar-available-panels="sideBarAvailablePanels"
      :side-bar-panel-context="sideBarPanelContext"
      :is-side-bar-open="isSideBarOpen"
      :show-batch-actions="!!selectedGroups.length"
      :batch-actions="batchActions"
      :batch-action-items="selectedGroups"
      :show-view-options="true"
    >
      <template #topbarActions>
        <div>
          <oc-button
            id="create-group-btn"
            class="oc-mr-s"
            variation="primary"
            appearance="filled"
            @click="createGroupAction.handler()"
          >
            <oc-icon :name="createGroupAction.icon" />
            <span v-text="createGroupAction.label()" />
          </oc-button>
        </div>
      </template>
      <template #mainContent>
        <app-loading-spinner v-if="isLoading" />
        <template v-else>
          <no-content-message
            v-if="!groups.length"
            id="admin-settings-groups-empty"
            class="files-empty"
            icon="user"
          >
            <template #message>
              <span v-translate>No groups in here</span>
            </template>
          </no-content-message>
          <div v-else>
            <groups-list>
              <template #contextMenu>
                <context-actions :action-options="{ resources: selectedGroups }" />
              </template>
            </groups-list>
          </div>
        </template>
      </template>
    </app-template>
  </div>
</template>

<script lang="ts">
import AppTemplate from '../components/AppTemplate.vue'
import ContextActions from '../components/Groups/ContextActions.vue'
import DetailsPanel from '../components/Groups/SideBar/DetailsPanel.vue'
import EditPanel from '../components/Groups/SideBar/EditPanel.vue'
import GroupsList from '../components/Groups/GroupsList.vue'
import MembersPanel from '../components/Groups/SideBar/MembersPanel.vue'
import { useGroupSettingsStore } from '../composables'
import { useGroupActionsCreateGroup, useGroupActionsDelete } from '../composables/actions/groups'
import {
  AppLoadingSpinner,
  NoContentMessage,
  SideBarPanel,
  SideBarPanelContext,
  useClientService,
  useSideBar
} from '@ownclouders/web-pkg'
import { Group } from '@ownclouders/web-client/graph/generated'
import { computed, defineComponent, ref, unref, onBeforeUnmount, onMounted } from 'vue'
import { useTask } from 'vue-concurrency'
import { useGettext } from 'vue3-gettext'
import { storeToRefs } from 'pinia'
import { call } from '@ownclouders/web-client'

export default defineComponent({
  components: {
    AppLoadingSpinner,
    AppTemplate,
    GroupsList,
    NoContentMessage,
    ContextActions
  },
  provide() {
    return {
      group: computed(() => this.selectedGroups[0])
    }
  },
  setup() {
    const template = ref()
    const groupSettingsStore = useGroupSettingsStore()
    const { selectedGroups, groups } = storeToRefs(groupSettingsStore)
    const clientService = useClientService()
    const { $gettext } = useGettext()

    const { actions: createGroupActions } = useGroupActionsCreateGroup()
    const createGroupAction = computed(() => unref(createGroupActions)[0])

    const loadResourcesTask = useTask(function* (signal) {
      const loadedGroups = yield* call(
        clientService.graphAuthenticated.groups.listGroups(
          {
            orderBy: ['displayName'],
            expand: ['members']
          },
          { signal }
        )
      )
      groupSettingsStore.setGroups(loadedGroups || [])
    }).restartable()

    const { actions: deleteActions } = useGroupActionsDelete()
    const batchActions = computed(() => {
      return [...unref(deleteActions)].filter((item) =>
        item.isVisible({ resources: unref(selectedGroups) })
      )
    })

    const isLoading = computed(() => {
      return loadResourcesTask.isRunning || !loadResourcesTask.last
    })

    const sideBarPanelContext = computed<SideBarPanelContext<unknown, unknown, Group>>(() => {
      return {
        parent: null,
        items: unref(selectedGroups)
      }
    })

    const sideBarAvailablePanels = [
      {
        name: 'DetailsPanel',
        icon: 'group-2',
        title: () => $gettext('Details'),
        component: DetailsPanel,
        componentAttrs: () => ({ groups: unref(selectedGroups) }),
        isRoot: () => true,
        isVisible: () => true
      },
      {
        name: 'EditPanel',
        icon: 'pencil',
        title: () => $gettext('Edit group'),
        component: EditPanel,
        componentAttrs: ({ items }) => {
          return {
            group: items.length === 1 ? items[0] : null
          }
        },
        isVisible: ({ items }) => {
          return items.length === 1 && !items[0].groupTypes?.includes('ReadOnly')
        }
      },
      {
        name: 'GroupMembers',
        icon: 'group',
        title: () => $gettext('Members'),
        component: MembersPanel,
        isVisible: ({ items }) => items.length === 1
      }
    ] satisfies SideBarPanel<unknown, unknown, Group>[]

    onMounted(async () => {
      await loadResourcesTask.perform()
    })

    onBeforeUnmount(() => {
      groupSettingsStore.reset()
    })

    return {
      ...useSideBar(),
      groups,
      selectedGroups,
      template,
      loadResourcesTask,
      clientService,
      batchActions,
      sideBarAvailablePanels,
      sideBarPanelContext,
      createGroupAction,
      groupSettingsStore,
      isLoading
    }
  },
  computed: {
    breadcrumbs() {
      return [
        { text: this.$gettext('Administration Settings'), to: { path: '/admin-settings' } },
        {
          text: this.$gettext('Groups'),
          onClick: () => {
            this.groupSettingsStore.setSelectedGroups([])
            this.loadResourcesTask.perform()
          }
        }
      ]
    }
  }
})
</script>
