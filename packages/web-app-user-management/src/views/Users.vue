<template>
  <div>
    <create-user-modal
      v-if="createUserModalOpen"
      @cancel="toggleCreateUserModal"
      @confirm="createUser"
    />
    <main class="oc-flex oc-flex-column oc-height-1-1 oc-p-m">
      <app-loading-spinner v-if="loadResourcesTask.isRunning" />
      <template v-else>
        <div class="oc-app-bar">
          <oc-breadcrumb :items="breadcrumbs" />
          <div class="oc-flex-1 oc-flex oc-flex-start">
            <div
              v-if="selectedUsers.length"
              class="oc-flex oc-flex-middle oc-text-nowrap size-info oc-visible@l"
            >
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
              <oc-button appearance="outline" class="oc-ml-m" @click="deleteSelectedUsersTrigger">
                <oc-icon name="delete-bin" />
                <translate>Delete</translate>
              </oc-button>
            </div>
            <div v-else class="oc-flex oc-flex-middle oc-text-nowrap size-info oc-visible@l">
              <oc-button
                variation="primary"
                appearance="filled"
                class="oc-ml-m"
                @click="toggleCreateUserModal"
              >
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
            :selected-users="selectedUsers"
            @toggleSelectUser="toggleSelectUser"
            @toggleSelectAllUser="toggleSelectAllUsers"
          />
        </div>
      </template>
    </main>
  </div>
</template>

<script>
import UsersList from '../components/Users/UsersList.vue'
import CreateUserModal from '../components/Users/CreateUserModal.vue'
import AppLoadingSpinner from 'web-pkg/src/components/AppLoadingSpinner.vue'
import NoContentMessage from 'web-pkg/src/components/NoContentMessage.vue'
import { useStore } from 'web-pkg/src/composables'
import { ref } from '@vue/composition-api'
import { clientService } from 'web-pkg/src/services'
import { useTask } from 'vue-concurrency'
import { bus } from 'web-pkg/src/instance'
import { mapActions } from 'vuex'

export default {
  components: { UsersList, AppLoadingSpinner, NoContentMessage, CreateUserModal },
  setup() {
    const store = useStore()
    const users = ref([])
    const graphClient = clientService.graphAuthenticated(
      store.getters.configuration.server,
      store.getters.getToken
    )

    const loadResourcesTask = useTask(function* (signal, ref) {
      const response = yield graphClient.users.listUsers('displayName')
      users.value = response.data.value || []
    })

    return {
      users,
      loadResourcesTask,
      graphClient
    }
  },
  data: function () {
    return {
      selectedUsers: [],
      createUserModalOpen: false
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
    ...mapActions(['showMessage', 'createModal', 'hideModal']),
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

    deleteSelectedUsersTrigger() {
      const modal = {
        variation: 'danger',
        title: this.$gettextInterpolate(
          this.$ngettext(
            'Delete user %{user}?',
            'Delete %{userCount} selected users?',
            this.selectedUsers.length
          ),
          {
            userCount: this.selectedUsers.length,
            user:
              this.selectedUsers[0].displayName || this.selectedUsers[0].onPremisesSamAccountName
          }
        ),
        cancelText: this.$gettext('Cancel'),
        confirmText: this.$gettext('Delete'),
        icon: 'alarm-warning',
        message: this.$gettextInterpolate(
          this.$ngettext(
            'Are you sure you want to delete this user?',
            'Are you sure you want to delete all selected users?',
            this.selectedUsers.length
          ),
          {
            userCount: this.selectedUsers.length
          }
        ),
        hasInput: false,
        onCancel: this.hideModal,
        onConfirm: () => this.deleteSelectedUsers()
      }

      this.createModal(modal)
    },

    deleteSelectedUsers() {
      const promises = []
      this.selectedUsers.reduce((acc, user) => {
        acc.push(this.graphClient.users.deleteUser(user.id))
        return acc
      }, promises)

      Promise.all(promises)
        .then(() => {
          this.showMessage({
            title: this.$gettextInterpolate(
              this.$ngettext(
                'User "%{user}" was deleted successfully',
                '%{userCount} users were deleted successfully',
                this.selectedUsers.length
              ),
              {
                userCount: this.selectedUsers.length,
                user:
                  this.selectedUsers[0].displayName ||
                  this.selectedUsers[0].onPremisesSamAccountName
              },
              true
            )
          })
          this.users = this.users.filter((user) => {
            return !this.selectedUsers.find((selectedUser) => user.id === selectedUser.id)
          })
          this.selectedUsers = []
          this.hideModal()
        })
        .catch(() => {
          this.showMessage({
            title: this.$gettextInterpolate(
              this.$ngettext(
                'Failed to delete user "%{user}"',
                'Failed to delete %{userCount} users',
                this.selectedUsers.length
              ),
              {
                userCount: this.selectedUsers.length,
                user:
                  this.selectedUsers[0].displayName ||
                  this.selectedUsers[0].onPremisesSamAccountName
              },
              true
            ),
            status: 'danger'
          })
        })
    },

    toggleCreateUserModal() {
      this.createUserModalOpen = !this.createUserModalOpen
    },

    createUser(user) {
      this.graphClient.users
        .createUser(user)
        .then((response) => {
          this.toggleCreateUserModal()
          this.showMessage({
            title: this.$gettext('User was created successfully')
          })
          this.users.push(response.data)
        })
        .catch(() => {
          this.showMessage({
            title: this.$gettext('Failed to create user'),
            status: 'danger'
          })
        })
    }
  }
}
</script>
