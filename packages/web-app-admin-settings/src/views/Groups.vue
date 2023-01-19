<template>
  <div>
    <app-template
      ref="template"
      :loading="loadResourcesTask.isRunning || !loadResourcesTask.last"
      :breadcrumbs="breadcrumbs"
      :side-bar-active-panel="sideBarActivePanel"
      :side-bar-available-panels="sideBarAvailablePanels"
      :side-bar-open="sideBarOpen"
    >
      <template #topbarActions>
        <div class="admin-settings-app-bar-actions oc-mt-xs">
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
            @toggleSelectGroup="toggleSelectGroup"
            @toggleSelectAllGroups="toggleSelectAllGroups"
            @unSelectAllGroups="unselectAllGroups"
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
import { defineComponent, ref, unref, onBeforeUnmount, onMounted } from 'vue'
import { useTask } from 'vue-concurrency'
import { eventBus } from 'web-pkg/src/services/eventBus'
import { mapActions } from 'vuex'
import DetailsPanel from '../components/Groups/SideBar/DetailsPanel.vue'
import EditPanel from '../components/Groups/SideBar/EditPanel.vue'
import { useGraphClient } from 'web-pkg/src/composables'
import AppTemplate from '../components/AppTemplate.vue'
import { useSideBar } from 'web-pkg/src/composables/sideBar'

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
    const loadResourcesEventToken = ref()
    const template = ref()
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

    onMounted(async () => {
      await loadResourcesTask.perform()
      loadResourcesEventToken.value = eventBus.subscribe('app.admin-settings.list.load', () => {
        loadResourcesTask.perform()
      })
      calculateListHeaderPosition()
      window.addEventListener('resize', calculateListHeaderPosition)
    })

    onBeforeUnmount(() => {
      eventBus.unsubscribe('app.admin-settings.list.load', unref(loadResourcesEventToken))
    })

    return {
      ...useSideBar(),
      groups,
      template,
      loadResourcesTask,
      graphClient,
      listHeaderPosition
    }
  },
  data: function () {
    return {
      selectedGroups: [],
      createGroupModalOpen: false,
      deleteGroupModalOpen: false
    }
  },
  computed: {
    selectedGroupsText() {
      const translated = this.$gettext('%{ groupCount } selected')

      return this.$gettextInterpolate(translated, { groupCount: this.selectedGroups.length })
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
    toggleDeleteGroupModal() {
      this.deleteGroupModalOpen = !this.deleteGroupModalOpen
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
