<template>
  <div>
    <app-template
      ref="template"
      :loading="loadResourcesTask.isRunning || !loadResourcesTask.last"
      :breadcrumbs="breadcrumbs"
      :side-bar-active-panel="sideBarActivePanel"
      :side-bar-available-panels="sideBarAvailablePanels"
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
            @click="toggleCreateGroupModal"
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
      @cancel="toggleCreateGroupModal"
      @confirm="createGroup"
    />
  </div>
</template>

<script lang="ts">
import GroupsList from '../components/Groups/GroupsList.vue'
import CreateGroupModal from '../components/Groups/CreateGroupModal.vue'
import ContextActions from '../components/Groups/ContextActions.vue'
import { NoContentMessage } from '@ownclouders/web-pkg'
import { computed, defineComponent, ref, unref, onBeforeUnmount, onMounted } from 'vue'
import { useTask } from 'vue-concurrency'
import { eventBus } from '@ownclouders/web-pkg'
import { mapActions } from 'vuex'
import DetailsPanel from '../components/Groups/SideBar/DetailsPanel.vue'
import EditPanel from '../components/Groups/SideBar/EditPanel.vue'
import { queryItemAsString, useClientService, useRouteQuery, useStore } from '@ownclouders/web-pkg'
import AppTemplate from '../components/AppTemplate.vue'
import { useSideBar } from '@ownclouders/web-pkg'
import { useGroupActionsDelete } from '../composables/actions/groups'
import MembersPanel from '../components/Groups/SideBar/MembersPanel.vue'

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
      batchActions
    }
  },
  computed: {
    selectedGroupsText() {
      return this.$gettext('%{count} groups selected', {
        count: this.selectedGroups.length.toString()
      })
    },
    breadcrumbs() {
      return [
        { text: this.$gettext('Administration Settings'), to: { path: '/admin-settings' } },
        {
          text: this.$gettext('Groups'),
          onClick: () => eventBus.publish('app.admin-settings.list.load')
        }
      ]
    },
    sideBarAvailablePanels() {
      return [
        {
          app: 'DetailsPanel',
          icon: 'group-2',
          title: this.$gettext('Group details'),
          component: DetailsPanel,
          default: true,
          enabled: true,
          componentAttrs: { groups: this.selectedGroups }
        },
        {
          app: 'EditPanel',
          icon: 'pencil',
          title: this.$gettext('Edit group'),
          component: EditPanel,
          default: false,
          enabled:
            this.selectedGroups.length === 1 &&
            !this.selectedGroups[0].groupTypes?.includes('ReadOnly'),
          componentAttrs: {
            group: this.selectedGroups.length === 1 ? this.selectedGroups[0] : null,
            onConfirm: this.editGroup
          }
        },
        {
          app: 'GroupMembers',
          icon: 'group',
          title: this.$gettext('Members'),
          component: MembersPanel,
          default: false,
          enabled: this.selectedGroups.length === 1
        }
      ].filter((p) => p.enabled)
    }
  },

  methods: {
    ...mapActions(['showMessage', 'showErrorMessage']),

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
    },
    toggleCreateGroupModal() {
      this.createGroupModalOpen = !this.createGroupModalOpen
    },
    async createGroup(group) {
      try {
        const client = this.clientService.graphAuthenticated
        const response = await client.groups.createGroup(group)
        this.toggleCreateGroupModal()
        this.showMessage({
          title: this.$gettext('Group was created successfully')
        })
        this.groups.push({ ...response?.data, members: [] })
      } catch (error) {
        console.error(error)
        this.showErrorMessage({
          title: this.$gettext('Failed to create group'),
          error
        })
      }
    },
    async editGroup(editGroup) {
      try {
        const client = this.clientService.graphAuthenticated
        await client.groups.editGroup(editGroup.id, editGroup)
        const { data: updatedGroup } = await client.groups.getGroup(editGroup.id)
        const groupIndex = this.groups.findIndex((group) => group.id === editGroup.id)
        this.groups[groupIndex] = updatedGroup
        const selectedGroupIndex = this.selectedGroups.findIndex(
          (group) => group.id === updatedGroup.id
        )
        if (selectedGroupIndex >= 0) {
          // FIXME: why do we need to update selectedUsers?
          this.selectedGroups[selectedGroupIndex] = updatedGroup
        }

        eventBus.publish('sidebar.entity.saved')

        return updatedGroup
      } catch (error) {
        console.error(error)
        this.showErrorMessage({
          title: this.$gettext('Failed to edit group'),
          error
        })
      }
    }
  }
})
</script>
