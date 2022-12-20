<template>
  <div>
    <app-template
      ref="template"
      :loading="loadResourcesTask.isRunning || !loadResourcesTask.last"
      :breadcrumbs="breadcrumbs"
      :side-bar-active-panel="sideBarActivePanel"
      :side-bar-available-panels="sideBarAvailablePanels"
      :side-bar-open="sideBarOpen"
      @selectPanel="selectPanel"
      @closeSideBar="closeSideBar"
      @toggleSideBar="toggleSideBar"
    >
      <template #topbarActions>
        <div class="user-management-app-bar-actions oc-mt-xs">
          <div v-if="selectedGroups.length" class="oc-flex oc-flex-middle">
            <span v-text="selectedGroupsText" />
            <oc-button
              id="files-clear-selection"
              v-oc-tooltip="$gettext('Clear selection')"
              :aria-label="$gettext('Clear selection')"
              class="oc-ml-m"
              appearance="outline"
              @click="unselectAllGroups"
            >
              <oc-icon name="close" />
            </oc-button>
            <oc-button appearance="outline" class="oc-ml-m" @click="toggleDeleteGroupModal">
              <oc-icon name="delete-bin" />
              <span v-text="$gettext('Delete')" />
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
          id="user-management-groups-empty"
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
            @toggleSelectGroup="toggleSelectGroup"
            @toggleSelectAllGroups="toggleSelectAllGroups"
            @showPanel="showPanel"
          />
        </div>
      </template>
    </app-template>
    <create-group-modal
      v-if="createGroupModalOpen"
      :existing-groups="groups"
      @cancel="toggleCreateGroupModal"
      @confirm="createGroup"
    />
    <delete-group-modal
      v-if="deleteGroupModalOpen"
      :groups="selectedGroups"
      @cancel="toggleDeleteGroupModal"
      @confirm="deleteGroups"
    />
  </div>
</template>

<script lang="ts">
import GroupsList from '../components/Groups/GroupsList.vue'
import CreateGroupModal from '../components/Groups/CreateGroupModal.vue'
import DeleteGroupModal from '../components/Groups/DeleteGroupModal.vue'
import NoContentMessage from 'web-pkg/src/components/NoContentMessage.vue'
import { ref, unref } from '@vue/composition-api'
import { useTask } from 'vue-concurrency'
import { eventBus } from 'web-pkg/src/services/eventBus'
import { mapActions } from 'vuex'
import DetailsPanel from '../components/Groups/SideBar/DetailsPanel.vue'
import EditPanel from '../components/Groups/SideBar/EditPanel.vue'
import { useGraphClient } from 'web-pkg/src/composables'
import { defineComponent } from '@vue/composition-api'
import AppTemplate from '../components/AppTemplate.vue'

export default defineComponent({
  components: {
    AppTemplate,
    GroupsList,
    NoContentMessage,
    CreateGroupModal,
    DeleteGroupModal
  },
  setup() {
    const groups = ref([])
    const { graphClient } = useGraphClient()

    const loadResourcesTask = useTask(function* (signal, ref) {
      const response = yield unref(graphClient).groups.listGroups('displayName')
      groups.value = response.data.value || []
      groups.value.forEach((group) => {
        group.members = group.members || []
      })
    })

    return {
      groups,
      loadResourcesTask,
      graphClient
    }
  },
  data: function () {
    return {
      listHeaderPosition: 0,
      selectedGroups: [],
      createGroupModalOpen: false,
      deleteGroupModalOpen: false,
      sideBarOpen: false,
      sideBarActivePanel: 'DetailsPanel'
    }
  },
  computed: {
    selectedGroupsText() {
      const translated = this.$gettext('%{ groupCount } selected')

      return this.$gettextInterpolate(translated, { groupCount: this.selectedGroups.length })
    },
    breadcrumbs() {
      return [
        { text: this.$gettext('User management'), to: { path: '/user-management' } },
        {
          text: this.$gettext('Groups'),
          onClick: () => eventBus.publish('app.user-management.list.load')
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
      ]
    },

    toggleSidebarButtonLabel() {
      return this.$gettext(
        this.sideBarOpen ? 'Close sidebar to hide details' : 'Open sidebar to view details'
      )
    },

    toggleSidebarButtonIconFillType() {
      return this.sideBarOpen ? 'fill' : 'line'
    }
  },

  watch: {
    selectedGroups() {
      if (!this.selectedGroups.length || this.selectedGroups.length > 1) {
        this.sideBarActivePanel = 'DetailsPanel'
      }
    }
  },

  async mounted() {
    await this.loadResourcesTask.perform(this)

    const loadResourcesEventToken = eventBus.subscribe('app.user-management.list.load', () => {
      this.loadResourcesTask.perform(this)
    })

    this.calculateListHeaderPosition()

    window.addEventListener('resize', this.calculateListHeaderPosition)

    this.$on('beforeDestroy', () => {
      eventBus.unsubscribe('app.user-management.list.load', loadResourcesEventToken)
    })
  },

  methods: {
    ...mapActions(['showMessage']),

    calculateListHeaderPosition() {
      this.listHeaderPosition = this.$refs?.template?.$refs?.appBar?.getBoundingClientRect()?.height
    },
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
    toggleDeleteGroupModal() {
      this.deleteGroupModalOpen = !this.deleteGroupModalOpen
    },
    selectPanel(panel) {
      this.sideBarActivePanel = panel || 'DetailsPanel'
    },
    toggleSideBar() {
      this.sideBarOpen = !this.sideBarOpen
    },
    closeSideBar() {
      this.sideBarOpen = false
    },
    showPanel({ group, panel }) {
      this.selectedGroups = [group]
      this.sideBarActivePanel = panel
      this.sideBarOpen = true
    },
    async deleteGroups(groups) {
      const promises = groups.map((group) => this.graphClient.groups.deleteGroup(group.id))

      try {
        await Promise.all(promises)
        this.showMessage({
          title: this.$gettextInterpolate(
            this.$ngettext(
              'Group "%{group}" was deleted successfully',
              '%{groupCount} groups were deleted successfully',
              this.selectedGroups.length
            ),
            {
              groupCount: this.selectedGroups.length,
              group: this.selectedGroups[0].displayName
            },
            true
          )
        })
        this.groups = this.groups.filter((group) => {
          return !groups.find((deletedGroup) => group.id === deletedGroup.id)
        })
        this.selectedGroups = []
        this.toggleDeleteGroupModal()
      } catch (error) {
        console.error(error)
        this.showMessage({
          title: this.$gettextInterpolate(
            this.$ngettext(
              'Failed to delete group "%{group}"',
              'Failed to delete %{groupCount} groups',
              this.selectedGroups.length
            ),
            {
              groupCount: this.selectedGroups.length,
              group: this.selectedGroups[0].displayName
            },
            true
          ),
          status: 'danger'
        })
      }
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
