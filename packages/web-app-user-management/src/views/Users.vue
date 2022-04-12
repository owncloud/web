<template>
  <div>
    <create-user-modal
      v-if="createUserModalOpen"
      :existing-users="users"
      @cancel="toggleCreateUserModal"
      @confirm="createUser"
    />
    <delete-user-modal
      v-if="deleteUserModalOpen"
      :users="selectedUsers"
      @cancel="toggleDeleteUserModal"
      @confirm="deleteUsers"
    />
    <main class="oc-flex oc-height-1-1 app-content oc-width-1-1">
      <app-loading-spinner v-if="loadResourcesTask.isRunning" />
      <template v-else>
        <div class="files-list-wrapper oc-width-expand">
          <div class="oc-app-bar oc-p-m">
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
            <div class="oc-flex-1 oc-flex oc-flex-start oc-mt-m">
              <div v-if="selectedUsers.length" class="oc-flex oc-flex-middle">
                <span v-text="selectedUsersText" />
                <oc-button
                  id="files-clear-selection"
                  v-oc-tooltip="$gettext('Clear selection')"
                  :aria-label="$gettext('Clear selection')"
                  class="oc-ml-m"
                  appearance="outline"
                  @click="unselectAllUsers"
                >
                  <oc-icon name="close" />
                </oc-button>
                <oc-button appearance="outline" class="oc-ml-m" @click="toggleDeleteUserModal">
                  <oc-icon name="delete-bin" />
                  <translate>Delete</translate>
                </oc-button>
              </div>
              <div v-else>
                <oc-button variation="primary" appearance="filled" @click="toggleCreateUserModal">
                  <oc-icon name="add" />
                  <translate>New user</translate>
                </oc-button>
              </div>
            </div>
          </div>
          <no-content-message
            v-if="!users.length"
            id="user-management-users-empty"
            class="files-empty"
            icon="user"
          >
            <template #message>
              <span v-translate>No users in here</span>
            </template>
          </no-content-message>
          <div v-else>
            <UsersList
              :users="users"
              :user-roles="userRoles"
              :selected-users="selectedUsers"
              class="oc-mt-m"
              @toggleSelectUser="toggleSelectUser"
              @toggleSelectAllUsers="toggleSelectAllUsers"
              @clickDetails="showDetailsSideBarPanel"
              @clickEdit="showEditSideBarPanel"
            />
          </div>
        </div>
        <side-bar
          v-if="sideBarOpen"
          class="users-sidebar oc-width-1-1 oc-width-1-3@m oc-width-1-4@xl"
          :available-panels="availableSideBarPanels"
          :sidebar-active-panel="activePanel"
          :loading="false"
          @selectPanel="selectPanel"
          @close="closeSideBar"
        >
          <template #body>
            <DetailsPanel
              v-if="activePanel === 'DetailsPanel'"
              :users="selectedUsers"
              :user-roles="userRoles"
            />
            <EditPanel
              v-if="activePanel === 'EditPanel'"
              :users="selectedUsers"
              :user-roles="userRoles"
              :roles="roles"
              @confirm="editUser"
            />
          </template>
        </side-bar>
      </template>
    </main>
  </div>
</template>

<script>
import UsersList from '../components/Users/UsersList.vue'
import CreateUserModal from '../components/Users/CreateUserModal.vue'
import DeleteUserModal from '../components/Users/DeleteUserModal.vue'
import DetailsPanel from '../components/Users/SideBar/DetailsPanel.vue'
import EditPanel from '../components/Users/SideBar/EditPanel.vue'
import AppLoadingSpinner from 'web-pkg/src/components/AppLoadingSpinner.vue'
import NoContentMessage from 'web-pkg/src/components/NoContentMessage.vue'
import SideBar from 'web-pkg/src/components/sidebar/SideBar.vue'
import { useStore } from 'web-pkg/src/composables'
import { ref } from '@vue/composition-api'
import { clientService } from 'web-pkg/src/services'
import { useTask } from 'vue-concurrency'
import { bus } from 'web-pkg/src/instance'
import { mapActions, mapGetters } from 'vuex'
import axios from 'axios'
import { $gettext } from 'files/src/router/utils'

export default {
  components: {
    EditPanel,
    DetailsPanel,
    UsersList,
    AppLoadingSpinner,
    NoContentMessage,
    CreateUserModal,
    DeleteUserModal,
    SideBar
  },
  setup() {
    const store = useStore()
    const users = ref([])
    const roles = ref([])
    const userAssignments = ref({})
    const graphClient = clientService.graphAuthenticated(
      store.getters.configuration.server,
      store.getters.getToken
    )

    /**
     * Setting api calls are just temporary and will be replaced with the graph api,
     * as the backend supports it.
     */
    const loadRolesTask = useTask(function* (signal, ref) {
      const rolesResponse = yield axios.post(
        '/api/v0/settings/roles-list',
        {},
        {
          headers: {
            authorization: `Bearer ${store.getters.getToken}`
          }
        }
      )
      roles.value = rolesResponse.data.bundles
    })

    /**
     * Setting api calls are just temporary and will be replaced with the graph api,
     * as the backend supports it.
     */
    const loadUserAssignmentTask = useTask(function* (signal, ref) {
      const userAssignmentResponse = yield axios.post(
        '/api/v0/settings/assignments-list',
        {
          account_uuid: ref.user?.id
        },
        {
          headers: {
            authorization: `Bearer ${store.getters.getToken}`
          }
        }
      )
      userAssignments.value[ref.user?.id] = userAssignmentResponse.data?.assignments
    })

    const loadResourcesTask = useTask(function* (signal, ref) {
      const usersResponse = yield graphClient.users.listUsers('displayName')
      users.value = usersResponse.data.value || []

      yield loadRolesTask.perform()

      for (const user of users.value) {
        yield loadUserAssignmentTask.perform({ user })
      }
    })

    return {
      users,
      roles,
      userAssignments,
      loadResourcesTask,
      graphClient
    }
  },
  data: function () {
    return {
      selectedUsers: [],
      createUserModalOpen: false,
      deleteUserModalOpen: false,
      sideBarOpen: false,
      activePanel: 'DetailsPanel'
    }
  },
  computed: {
    ...mapGetters(['getToken']),
    userRoles() {
      return this.users.reduce((acc, user) => {
        if (!(user.id in this.userAssignments)) {
          return acc
        }

        const userAssignmentList = this.userAssignments[user.id]

        const userRoleAssignment = userAssignmentList.find((assignment) => 'roleId' in assignment)

        if (!userRoleAssignment) {
          return acc
        }

        const role = this.roles.find((role) => role.id === userRoleAssignment.roleId)

        if (!role) {
          return acc
        }

        acc[user.id] = role

        return acc
      }, {})
    },
    selectedUsersText() {
      const translated = this.$gettext('%{ userCount } selected')

      return this.$gettextInterpolate(translated, { userCount: this.selectedUsers.length })
    },
    breadcrumbs() {
      return [
        { text: this.$gettext('User management'), to: { path: '/user-management' } },
        {
          text: this.$gettext('Users'),
          onClick: () => bus.publish('app.user-management.list.load')
        }
      ]
    },

    allUsersSelected() {
      return this.users.length === this.selectedUsers.length
    },

    availableSideBarPanels() {
      return [
        {
          app: 'DetailsPanel',
          icon: 'user',
          title: $gettext('User details'),
          component: DetailsPanel,
          default: true,
          enabled: true
        },
        {
          app: 'EditPanel',
          icon: 'pencil',
          title: $gettext('Edit user'),
          component: EditPanel,
          default: false,
          enabled: this.selectedUsers.length === 1
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
    selectedUsers() {
      if (!this.selectedUsers.length || this.selectedUsers.length > 1) {
        this.activePanel = 'DetailsPanel'
      }
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
    toggleSelectAllUsers() {
      if (this.allUsersSelected) {
        return (this.selectedUsers = [])
      }
      this.selectedUsers = [...this.users]
    },

    toggleSelectUser(toggledUser) {
      const isUserSelected = this.selectedUsers.find((user) => user.id === toggledUser.id)

      if (!isUserSelected) {
        return this.selectedUsers.push(toggledUser)
      }

      this.selectedUsers = this.selectedUsers.filter((user) => user.id !== toggledUser.id)
    },

    unselectAllUsers() {
      this.selectedUsers = []
    },

    toggleCreateUserModal() {
      this.createUserModalOpen = !this.createUserModalOpen
    },

    toggleDeleteUserModal() {
      this.deleteUserModalOpen = !this.deleteUserModalOpen
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

    showDetailsSideBarPanel(user) {
      this.selectedUsers = user ? [user] : []
      this.activePanel = 'DetailsPanel'
      this.sideBarOpen = true
    },

    showEditSideBarPanel(user) {
      this.selectedUsers = user ? [user] : []
      this.activePanel = 'EditPanel'
      this.sideBarOpen = true
    },

    async deleteUsers(users) {
      const promises = users.map((user) => this.graphClient.users.deleteUser(user.id))

      try {
        await Promise.all(promises)
        this.showMessage({
          title: this.$gettextInterpolate(
            this.$ngettext(
              'User "%{user}" was deleted successfully',
              '%{userCount} users were deleted successfully',
              this.selectedUsers.length
            ),
            {
              userCount: this.selectedUsers.length,
              user: this.selectedUsers[0].onPremisesSamAccountName
            },
            true
          )
        })
        this.users = this.users.filter((user) => {
          return !users.find((deletedUser) => user.id === deletedUser.id)
        })
        this.selectedUsers = []
        this.toggleDeleteUserModal()
      } catch (error) {
        console.error(error)
        this.showMessage({
          title: this.$gettextInterpolate(
            this.$ngettext(
              'Failed to delete user "%{user}"',
              'Failed to delete %{userCount} users',
              this.selectedUsers.length
            ),
            {
              userCount: users.length,
              user: users.onPremisesSamAccountName
            },
            true
          ),
          status: 'danger'
        })
      }
    },

    async createUser(user) {
      try {
        const response = await this.graphClient.users.createUser(user)
        this.toggleCreateUserModal()
        this.showMessage({
          title: this.$gettext('User was created successfully')
        })
        this.users.push(response?.data)
      } catch (error) {
        console.error(error)
        this.showMessage({
          title: this.$gettext('Failed to create user'),
          status: 'danger'
        })
      }
    },

    async editUser({ editUser, editUserRole }) {
      try {
        await this.graphClient.users.editUser(editUser.id, editUser)

        /**
         * Setting api calls are just temporary and will be replaced with the graph api,
         * as the backend supports it.
         */
        const assignmentsAddResponse = await axios.post(
          '/api/v0/settings/assignments-add',
          {
            account_uuid: editUser.id,
            role_id: editUserRole.id
          },
          {
            headers: {
              authorization: `Bearer ${this.getToken}`
            }
          }
        )

        const user = this.users.find((user) => user.id === editUser.id)
        Object.assign(user, editUser)
        this.userAssignments = Object.assign({}, this.userAssignments, {
          [editUser.id]: [assignmentsAddResponse.data?.assignment]
        })
        this.showMessage({
          title: this.$gettext('User was edited successfully')
        })
      } catch (error) {
        console.error(error)
        this.showMessage({
          title: this.$gettext('Failed to edit user'),
          status: 'danger'
        })
      }
    }
  }
}
</script>
<style lang="scss">
.users-sidebar {
  position: relative;
  overflow: hidden;
  border-left: 1px solid var(--oc-color-border);
}
</style>
