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
            :header-position="listHeaderPosition"
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
      :existing-groups="groups"
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
import {
  computed,
  defineComponent,
  ref,
  getCurrentInstance,
  unref,
  onBeforeUnmount,
  onMounted
} from 'vue'
import { useTask } from 'vue-concurrency'
import { eventBus } from 'web-pkg/src/services/eventBus'
import { mapActions } from 'vuex'
import DetailsPanel from '../components/Groups/SideBar/DetailsPanel.vue'
import EditPanel from '../components/Groups/SideBar/EditPanel.vue'
import { useGraphClient } from 'web-pkg/src/composables'
import AppTemplate from '../components/AppTemplate.vue'
import { useSideBar } from 'web-pkg/src/composables/sideBar'
import Delete from '../mixins/groups/delete'

export default defineComponent({
  components: {
    AppTemplate,
    GroupsList,
    NoContentMessage,
    CreateGroupModal,
    ContextActions
  },
  mixins: [Delete],
  setup() {
    const instance = getCurrentInstance().proxy as any
    const groups = ref([])
    let loadResourcesEventToken
    const template = ref()
    const selectedGroups = ref([])
    const createGroupModalOpen = ref(false)
    const listHeaderPosition = ref(0)
    const { graphClient } = useGraphClient()

    const loadResourcesTask = useTask(function* (signal) {
      const response = yield unref(graphClient).groups.listGroups('displayName')
      groups.value = response.data.value || []
      groups.value.forEach((group) => {
        group.members = group.members || []
      })
    })

    const calculateListHeaderPosition = () => {
      listHeaderPosition.value = unref(template)?.$refs?.appBar?.getBoundingClientRect()?.height
    }

    const batchActions = computed(() => {
      return [...instance.$_delete_items].filter((item) =>
        item.isEnabled({ resources: unref(selectedGroups) })
      )
    })

    onMounted(async () => {
      await loadResourcesTask.perform()
      loadResourcesEventToken = eventBus.subscribe('app.admin-settings.list.load', () => {
        loadResourcesTask.perform()
        selectedGroups.value = []
      })
      calculateListHeaderPosition()
      window.addEventListener('resize', calculateListHeaderPosition)
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
      graphClient,
      listHeaderPosition,
      batchActions
    }
  },
  computed: {
    selectedGroupsText() {
      return this.$gettext('%{ groupCount } selected', { groupCount: this.selectedGroups.length })
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
          enabled: false // this.selectedGroups.length === 1
          /**
           * Editing groups is currently not supported by backend
           */
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
        const response = await this.graphClient.groups.createGroup(group)
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
        await this.graphClient.groups.editGroup(editGroup.id, editGroup)
        const group = this.groups.find((group) => group.id === editGroup.id)
        Object.assign(group, editGroup)

        this.showMessage({
          title: this.$gettext('Group was edited successfully')
        })
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
