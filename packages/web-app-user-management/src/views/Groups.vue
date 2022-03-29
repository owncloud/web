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
    <main class="oc-flex oc-flex-column oc-height-1-1 oc-p-m">
      <app-loading-spinner v-if="loadResourcesTask.isRunning" />
      <template v-else>
        <div class="oc-app-bar">
          <div class="oc-flex oc-flex-between">
            <oc-breadcrumb class="oc-flex oc-flex-middle" :items="breadcrumbs" />
          </div>
          <div class="oc-flex-1 oc-flex oc-flex-start oc-mt-m">
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
            class="oc-mt-m"
            @toggleSelectGroup="toggleSelectGroup"
            @toggleSelectAllGroups="toggleSelectAllGroups"
          />
        </div>
      </template>
    </main>
  </div>
</template>

<script>
import GroupsList from '../components/Groups/GroupsList.vue'
import CreateGroupModal from '../components/Groups/CreateGroupModal.vue'
import DeleteGroupModal from '../components/Groups/DeleteGroupModal.vue'
import AppLoadingSpinner from 'web-pkg/src/components/AppLoadingSpinner.vue'
import NoContentMessage from 'web-pkg/src/components/NoContentMessage.vue'
import { useStore } from 'web-pkg/src/composables'
import { ref } from '@vue/composition-api'
import { clientService } from 'web-pkg/src/services'
import { useTask } from 'vue-concurrency'
import { bus } from 'web-pkg/src/instance'
import { mapActions } from 'vuex'

export default {
  components: {
    GroupsList,
    AppLoadingSpinner,
    NoContentMessage,
    CreateGroupModal,
    DeleteGroupModal
  },
  setup() {
    const store = useStore()
    const groups = ref([])
    const graphClient = clientService.graphAuthenticated(
      store.getters.configuration.server,
      store.getters.getToken
    )

    const loadResourcesTask = useTask(function* (signal, ref) {
      const response = yield graphClient.groups.listGroups('displayName')
      groups.value = response.data.value || []
    })

    return {
      groups,
      loadResourcesTask,
      graphClient
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
        { text: this.$gettext('User management'), to: { path: '/user-management' } },
        {
          text: this.$gettext('Groups'),
          onClick: () => bus.publish('app.user-management.list.load')
        }
      ]
    },

    allGroupsSelected() {
      return this.groups.length === this.selectedGroups.length
    }
  },

  async mounted() {
    await this.loadResourcesTask.perform(this)

    const loadResourcesEventToken = bus.subscribe('app.user-management.list.load', () => {
      this.loadResourcesTask.perform(this)
    })

    this.$on('beforeDestroy', () => {
      bus.unsubscribe('app.user-management.list.load', loadResourcesEventToken)
    })
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
        this.groups.push(response?.data)
      } catch (error) {
        console.error(error)
        this.showMessage({
          title: this.$gettext('Failed to create group'),
          status: 'danger'
        })
      }
    }
  }
}
</script>
