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
            @click="onToggleCreateGroupModal"
          >
            <oc-icon name="add" />
            <span v-text="$gettext('New group')" />
          </oc-button>
        </div>
      </template>
      <template #mainContent>
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
          <GroupsList
            :groups="groups"
            :selected-groups="selectedGroups"
            @toggle-select-group="toggleSelectGroup"
            @select-groups="selectGroups"
            @un-select-all-groups="unselectAllGroups"
          >
            <template #contextMenu>
              <context-actions :action-options="{ resources: selectedGroups }" />
            </template>
          </GroupsList>
        </div>
      </template>
    </app-template>
    <create-group-modal
      v-if="createGroupModalOpen"
      @cancel="onToggleCreateGroupModal"
      @confirm="onCreateGroup"
    />
  </div>
</template>

<script lang="ts">
import AppTemplate from '../components/AppTemplate.vue'
import CreateGroupModal from '../components/Groups/CreateGroupModal.vue'
import ContextActions from '../components/Groups/ContextActions.vue'
import DetailsPanel from '../components/Groups/SideBar/DetailsPanel.vue'
import EditPanel from '../components/Groups/SideBar/EditPanel.vue'
import GroupsList from '../components/Groups/GroupsList.vue'
import MembersPanel from '../components/Groups/SideBar/MembersPanel.vue'
import { useGroupActionsDelete } from '../composables'
import {
  NoContentMessage,
  SideBarPanel,
  SideBarPanelContext,
  eventBus,
  queryItemAsString,
  useClientService,
  useRouteQuery,
  useSideBar,
  useStore
} from '@ownclouders/web-pkg'
import { Group } from '@ownclouders/web-client/src/helpers'
import { computed, defineComponent, ref, unref, onBeforeUnmount, onMounted } from 'vue'
import { useTask } from 'vue-concurrency'
import { useGettext } from 'vue3-gettext'

export default defineComponent({
  components: {
    AppTemplate,
    GroupsList,
    NoContentMessage,
    CreateGroupModal,
    ContextActions
  },
  provide() {
    return {
      group: computed(() => this.selectedGroups[0])
    }
  },
  setup() {
    const store = useStore()
    const groups = ref([])
    let loadResourcesEventToken
    const template = ref()
    const selectedGroups = ref([])
    const createGroupModalOpen = ref(false)
    const clientService = useClientService()
    const { $gettext } = useGettext()

    const currentPageQuery = useRouteQuery('page', '1')
    const currentPage = computed(() => {
      return parseInt(queryItemAsString(unref(currentPageQuery)))
    })

    const itemsPerPageQuery = useRouteQuery('admin-settings-items-per-page', '1')
    const itemsPerPage = computed(() => {
      return parseInt(queryItemAsString(unref(itemsPerPageQuery)))
    })

    const loadResourcesTask = useTask(function* (signal) {
      const response = yield clientService.graphAuthenticated.groups.listGroups('displayName')
      groups.value = response.data.value || []
      groups.value.forEach((group) => {
        group.members = group.members || []
      })
    })

    const { actions: deleteActions } = useGroupActionsDelete({ store })
    const batchActions = computed(() => {
      return [...unref(deleteActions)].filter((item) =>
        item.isEnabled({ resources: unref(selectedGroups) })
      )
    })

    const onToggleCreateGroupModal = () => {
      createGroupModalOpen.value = !unref(createGroupModalOpen)
    }
    const onCreateGroup = async (group: Group) => {
      try {
        const client = clientService.graphAuthenticated
        const response = await client.groups.createGroup(group)
        onToggleCreateGroupModal()
        store.dispatch('showMessage', {
          title: $gettext('Group was created successfully')
        })
        groups.value.push({ ...response?.data, members: [] })
      } catch (error) {
        console.error(error)
        store.dispatch('showErrorMessage', {
          title: $gettext('Failed to create group'),
          error
        })
      }
    }
    const onEditGroup = async (editGroup: Group) => {
      try {
        const client = clientService.graphAuthenticated
        await client.groups.editGroup(editGroup.id, editGroup)
        const { data: updatedGroup } = await client.groups.getGroup(editGroup.id)
        const groupIndex = unref(groups).findIndex((group) => group.id === editGroup.id)
        groups.value[groupIndex] = updatedGroup
        const selectedGroupIndex = unref(selectedGroups).findIndex(
          (group) => group.id === updatedGroup.id
        )
        if (selectedGroupIndex >= 0) {
          // FIXME: why do we need to update selectedGroups?
          selectedGroups.value[selectedGroupIndex] = updatedGroup
        }

        eventBus.publish('sidebar.entity.saved')

        return updatedGroup
      } catch (error) {
        console.error(error)
        store.dispatch('showErrorMessage', {
          title: $gettext('Failed to edit group'),
          error
        })
      }
    }

    const sideBarPanelContext = computed<SideBarPanelContext<any, Group>>(() => {
      return {
        parent: null,
        items: unref(selectedGroups)
      }
    })
    const sideBarAvailablePanels = computed<SideBarPanel<any, Group>[]>(() => {
      return (
        [
          {
            name: 'DetailsPanel',
            icon: 'group-2',
            title: () => $gettext('Group details'),
            component: DetailsPanel,
            componentAttrs: () => ({ groups: unref(selectedGroups) }),
            isRoot: () => true,
            isEnabled: () => true
          },
          {
            name: 'EditPanel',
            icon: 'pencil',
            title: () => $gettext('Edit group'),
            component: EditPanel,
            componentAttrs: ({ items }) => {
              return {
                group: items.length === 1 ? items[0] : null,
                onConfirm: onEditGroup
              }
            },
            isEnabled: ({ items }) => {
              return items.length === 1 && !items[0].groupTypes?.includes('ReadOnly')
            }
          },
          {
            name: 'GroupMembers',
            icon: 'group',
            title: () => $gettext('Members'),
            component: MembersPanel,
            isEnabled: ({ items }) => items.length === 1
          }
        ] satisfies SideBarPanel<any, Group>[]
      ).filter((p) => p.isEnabled(unref(sideBarPanelContext)))
    })

    onMounted(async () => {
      await loadResourcesTask.perform()
      loadResourcesEventToken = eventBus.subscribe('app.admin-settings.list.load', async () => {
        await loadResourcesTask.perform()
        selectedGroups.value = []

        const pageCount = Math.ceil(unref(groups).length / unref(itemsPerPage))
        if (unref(currentPage) > 1 && unref(currentPage) > pageCount) {
          // reset pagination to avoid empty lists (happens when deleting all items on the last page)
          currentPageQuery.value = pageCount.toString()
        }
      })
    })

    onBeforeUnmount(() => {
      eventBus.unsubscribe('app.admin-settings.list.load', loadResourcesEventToken)
    })

    return {
      ...useSideBar(),
      groups,
      selectedGroups,
      createGroupModalOpen,
      template,
      loadResourcesTask,
      clientService,
      batchActions,
      sideBarAvailablePanels,
      sideBarPanelContext,
      onCreateGroup,
      onEditGroup,
      onToggleCreateGroupModal
    }
  },
  computed: {
    breadcrumbs() {
      return [
        { text: this.$gettext('Administration Settings'), to: { path: '/admin-settings' } },
        {
          text: this.$gettext('Groups'),
          onClick: () => eventBus.publish('app.admin-settings.list.load')
        }
      ]
    }
  },

  methods: {
    selectGroups(groups) {
      this.selectedGroups.splice(0, this.selectedGroups.length, ...groups)
    },
    toggleSelectGroup(toggledGroup, deselect = false) {
      if (deselect) {
        this.selectedGroups.splice(0, this.selectedGroups.length)
      }
      const isGroupSelected = this.selectedGroups.find((group) => group.id === toggledGroup.id)
      if (!isGroupSelected) {
        return this.selectedGroups.push(toggledGroup)
      }
      const index = this.selectedGroups.findIndex((group) => group.id === toggledGroup.id)
      this.selectedGroups.splice(index, 1)
    },
    unselectAllGroups() {
      this.selectedGroups.splice(0, this.selectedGroups.length)
    }
  }
})
</script>
