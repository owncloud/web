<template>
  <div>
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
    <main class="oc-flex oc-height-1-1 app-content oc-width-1-1">
      <app-loading-spinner v-if="loadResourcesTask.isRunning" />
      <template v-else>
        <div id="groups-wrapper" class="oc-width-expand">
          <div id="groups-app-bar" ref="appBar" class="oc-app-bar oc-py-s">
            <div class="oc-flex oc-flex-between">
              <oc-breadcrumb class="oc-flex oc-flex-middle" :items="breadcrumbs" />
              <div>
                <oc-button
                  id="files-toggle-sidebar"
                  v-oc-tooltip="toggleSidebarButtonLabel"
                  :aria-label="toggleSidebarButtonLabel"
                  appearance="raw"
                  class="oc-my-s oc-p-xs"
                  @click.stop="toggleSideBar"
                >
                  <oc-icon name="side-bar-right" :fill-type="toggleSidebarButtonIconFillType" />
                </oc-button>
              </div>
            </div>
            <div class="oc-flex-1 oc-flex oc-flex-start">
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
                  <translate>Delete</translate>
                </oc-button>
              </div>
              <div v-else>
                <oc-button variation="primary" appearance="filled" @click="toggleCreateGroupModal">
                  <oc-icon name="add" />
                  <translate>New group</translate>
                </oc-button>
              </div>
            </div>
          </div>
          <no-content-message
            v-if="!groups.length"
            id="user-management-groups-empty"
            class="files-empty"
            icon="group-2"
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
              @clickDetails="showDetailsSideBarPanel"
              @clickEdit="showEditSideBarPanel"
            />
          </div>
        </div>
        <side-bar
          v-if="sideBarOpen"
          class="groups-sidebar oc-width-1-1 oc-width-1-3@m oc-width-1-4@xl"
          :available-panels="availableSideBarPanels"
          :sidebar-active-panel="activePanel"
          :loading="false"
          @selectPanel="selectPanel"
          @close="closeSideBar"
        >
          <template #body>
            <DetailsPanel v-if="activePanel === 'DetailsPanel'" :groups="selectedGroups" />
            <EditPanel
              v-if="activePanel === 'EditPanel'"
              :groups="selectedGroups"
              @confirm="editGroup"
            />
          </template>
        </side-bar>
      </template>
    </main>
  </div>
</template>

<script lang="ts">
import GroupsList from '../components/Groups/GroupsList.vue'
import CreateGroupModal from '../components/Groups/CreateGroupModal.vue'
import DeleteGroupModal from '../components/Groups/DeleteGroupModal.vue'
import AppLoadingSpinner from 'web-pkg/src/components/AppLoadingSpinner.vue'
import NoContentMessage from 'web-pkg/src/components/NoContentMessage.vue'
import SideBar from 'web-pkg/src/components/sidebar/SideBar.vue'
import { ref, unref } from '@vue/composition-api'
import { useTask } from 'vue-concurrency'
import { bus } from 'web-pkg/src/instance'
import { mapActions } from 'vuex'
import { $gettext } from 'files/src/router/utils'
import DetailsPanel from '../components/Groups/SideBar/DetailsPanel.vue'
import EditPanel from '../components/Groups/SideBar/EditPanel.vue'
import { useGraphClient } from 'web-client/src/composables'
import { defineComponent } from '@vue/runtime-core'

export default defineComponent({
  components: {
    SideBar,
    EditPanel,
    DetailsPanel,
    GroupsList,
    AppLoadingSpinner,
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
      activePanel: 'DetailsPanel'
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
          onClick: () => bus.publish('app.user-management.list.load')
        }
      ]
    },

    allGroupsSelected() {
      return this.groups.length === this.selectedGroups.length
    },

    availableSideBarPanels() {
      return [
        {
          app: 'DetailsPanel',
          icon: 'group-2',
          title: $gettext('Group details'),
          component: DetailsPanel,
          default: true,
          enabled: true
        },
        {
          app: 'EditPanel',
          icon: 'pencil',
          title: $gettext('Edit group'),
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
        this.activePanel = 'DetailsPanel'
      }
    }
  },

  async mounted() {
    console.log('mounted')
    await this.loadResourcesTask.perform(this)

    const loadResourcesEventToken = bus.subscribe('app.user-management.list.load', () => {
      this.loadResourcesTask.perform(this)
    })

    this.calculateListHeaderPosition()

    window.addEventListener('resize', this.calculateListHeaderPosition)

    this.$on('beforeDestroy', () => {
      bus.unsubscribe('app.user-management.list.load', loadResourcesEventToken)
    })
  },

  methods: {
    ...mapActions(['showMessage']),
    calculateListHeaderPosition() {
      this.listHeaderPosition = this.$refs.appBar.getBoundingClientRect().height
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
      this.activePanel = panel || 'DetailsPanel'
    },

    toggleSideBar() {
      this.sideBarOpen = !this.sideBarOpen
    },

    closeSideBar() {
      this.sideBarOpen = false
    },

    showDetailsSideBarPanel(group) {
      this.selectedGroups = group ? [group] : []
      this.activePanel = 'DetailsPanel'
      this.sideBarOpen = true
    },

    showEditSideBarPanel(group) {
      this.selectedGroups = group ? [group] : []
      this.activePanel = 'EditPanel'
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

<style lang="scss">
#groups-app-bar {
  background-color: var(--oc-color-background-default);
  border-top-right-radius: 15px;
  box-sizing: border-box;
  z-index: 2;
  position: sticky;
  padding: 0 var(--oc-space-medium);
  top: 0;
}

#groups-wrapper {
  overflow-y: auto;
}

.groups-sidebar {
  position: relative;
  overflow: hidden;
  border-left: 1px solid var(--oc-color-border);
}
</style>
