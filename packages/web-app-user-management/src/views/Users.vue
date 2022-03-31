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
    <main class="oc-flex oc-flex-column oc-height-1-1 oc-p-m">
      <app-loading-spinner v-if="loadResourcesTask.isRunning" />
      <template v-else>
        <div class="oc-app-bar">
          <div class="oc-flex oc-flex-between">
            <oc-breadcrumb class="oc-flex oc-flex-middle" :items="breadcrumbs" />
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
            :roles="roles"
            :user-assignments="userAssignments"
            :selected-users="selectedUsers"
            class="oc-mt-m"
            @toggleSelectUser="toggleSelectUser"
            @toggleSelectAllUsers="toggleSelectAllUsers"
          />
        </div>
      </template>
    </main>
  </div>
</template>

<script>
import UsersList from '../components/Users/UsersList.vue'
import CreateUserModal from '../components/Users/CreateUserModal.vue'
import DeleteUserModal from '../components/Users/DeleteUserModal.vue'
import AppLoadingSpinner from 'web-pkg/src/components/AppLoadingSpinner.vue'
import NoContentMessage from 'web-pkg/src/components/NoContentMessage.vue'
import { useStore } from 'web-pkg/src/composables'
import { ref } from '@vue/composition-api'
import { clientService } from 'web-pkg/src/services'
import { useTask } from 'vue-concurrency'
import { bus } from 'web-pkg/src/instance'
import { mapActions } from 'vuex'
import axios from 'axios'

export default {
  components: { UsersList, AppLoadingSpinner, NoContentMessage, CreateUserModal, DeleteUserModal },
  setup() {
    const store = useStore()
    const users = ref([])
    const roles = ref([])
    const userAssignments = ref([])
    const graphClient = clientService.graphAuthenticated(
      store.getters.configuration.server,
      store.getters.getToken
    )

    const loadRolesTask = useTask(function* (signal, ref) {
      const rolesResponse = yield axios.post(
        '/api/v0/settings/roles-list',
        {},
        {
          headers: {
            authorization: store.getters.getToken
          }
        }
      )
      roles.value = rolesResponse.data.bundles
    })

    const loadUserAssignmentTask = useTask(function* (signal, ref) {
      const userAssignmentResponse = yield axios.post(
        '/api/v0/settings/assignments-list',
        {
          account_uuid: ref.user?.id
        },
        {
          headers: {
            authorization: store.getters.getToken
          }
        }
      )
      userAssignments.value.push(userAssignmentResponse.data?.assignments)
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
      deleteUserModalOpen: false
    }
  },
  computed: {
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
    }
  }
}
</script>
