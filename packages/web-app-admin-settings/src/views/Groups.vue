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
    >
      <template #topbarActions>
        <div class="admin-settings-app-bar-actions">
          <div v-if="selectedGroups.length" class="oc-flex oc-flex-middle">
            <span v-text="selectedGroupsText" />
            <oc-button
              id="groups-clear-selection"
              v-oc-tooltip="$gettext('Clear selection')"
              :aria-label="$gettext('Clear selection')"
              class="oc-ml-m oc-py-s"
              appearance="outline"
              @click="unselectAllGroups"
            >
              <oc-icon name="close" />
            </oc-button>
          </div>
          <div v-else>
            <oc-button variation="primary" appearance="filled" @click="toggleCreateGroupModal">
              <oc-icon name="add" />
              <span v-text="$gettext('New group')" />
            </oc-button>
          </div>
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
            @toggle-select-all-groups="toggleSelectAllGroups"
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
import NoContentMessage from 'web-pkg/src/components/NoContentMessage.vue'
import { computed, defineComponent, ref, unref, onBeforeUnmount, onMounted } from 'vue'
import { useTask } from 'vue-concurrency'
import { eventBus } from 'web-pkg/src/services/eventBus'
import { mapActions } from 'vuex'
import DetailsPanel from '../components/Groups/SideBar/DetailsPanel.vue'
import EditPanel from '../components/Groups/SideBar/EditPanel.vue'
import { useClientService, useStore } from 'web-pkg/src/composables'
import AppTemplate from '../components/AppTemplate.vue'
import { useSideBar } from 'web-pkg/src/composables/sideBar'
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
      loadResourcesEventToken = eventBus.subscribe('app.admin-settings.list.load', () => {
        loadResourcesTask.perform()
        selectedGroups.value = []
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

    allGroupsSelected() {
      return this.groups.length === this.selectedGroups.length
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
    ...mapActions(['showMessage']),

    toggleSelectAllGroups() {
      if (this.allGroupsSelected) {
        return (this.selectedGroups = [])
      }
      this.selectedGroups = [...this.groups]
    },
    toggleSelectGroup(toggledGroup) {
      const isGroupSelected = this.selectedGroups.find((group) => group.id === toggledGroup.id)
      if (!isGroupSelected) {
        return this.selectedGroups.push(toggledGroup)
      }
      this.selectedGroups = this.selectedGroups.filter((group) => group.id !== toggledGroup.id)
    },
    unselectAllGroups() {
      this.selectedGroups = []
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
        this.showMessage({
          title: this.$gettext('Failed to create group'),
          status: 'danger'
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
        this.showMessage({
          title: this.$gettext('Failed to edit group'),
          status: 'danger'
        })
      }
    }
  }
})
</script>
