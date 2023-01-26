<template>
  <div>
    <app-template
      ref="template"
      :loading="loadResourcesTask.isRunning || !loadResourcesTask.last"
      :breadcrumbs="breadcrumbs"
      :side-bar-active-panel="sideBarActivePanel"
      :side-bar-available-panels="sideBarAvailablePanels"
      :side-bar-open="sideBarOpen"
      :side-bar-loading="sideBarLoading"
    >
      <template #topbarActions>
        <div class="admin-settings-app-bar-actions oc-mt-xs">
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
              <span v-text="$gettext('Delete')" />
            </oc-button>
          </div>
          <div v-else>
            <oc-button variation="primary" appearance="filled" @click="toggleCreateUserModal">
              <oc-icon name="add" />
              <span v-text="$gettext('New user')" />
            </oc-button>
          </div>
        </div>
      </template>
      <template #mainContent>
        <no-content-message
          v-if="!users.length"
          id="admin-settings-users-empty"
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
            :class="{ 'users-table-squashed': sideBarOpen }"
            :selected-users="selectedUsers"
            :header-position="listHeaderPosition"
            @toggleSelectUser="toggleSelectUser"
            @toggleSelectAllUsers="toggleSelectAllUsers"
            @unSelectAllUsers="unselectAllUsers"
          />
        </div>
      </template>
    </app-template>
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
  </div>
</template>

<script lang="ts">
import isEqual from 'lodash-es/isEqual'
import omit from 'lodash-es/omit'
import UsersList from '../components/Users/UsersList.vue'
import CreateUserModal from '../components/Users/CreateUserModal.vue'
import DeleteUserModal from '../components/Users/DeleteUserModal.vue'
import DetailsPanel from '../components/Users/SideBar/DetailsPanel.vue'
import EditPanel from '../components/Users/SideBar/EditPanel.vue'
import NoContentMessage from 'web-pkg/src/components/NoContentMessage.vue'
import { useAccessToken, useStore } from 'web-pkg/src/composables'
import { defineComponent, ref, onBeforeUnmount, onMounted, unref, watch } from 'vue'
import { useTask } from 'vue-concurrency'
import { eventBus } from 'web-pkg/src/services/eventBus'
import { mapActions, mapGetters, mapMutations, mapState } from 'vuex'
import { useGraphClient } from 'web-pkg/src/composables'
import AppTemplate from '../components/AppTemplate.vue'
import { useSideBar } from 'web-pkg/src/composables/sideBar'

export default defineComponent({
  name: 'UsersView',
  components: {
    AppTemplate,
    UsersList,
    NoContentMessage,
    CreateUserModal,
    DeleteUserModal
  },
  setup() {
    const store = useStore()
    const accessToken = useAccessToken({ store })
    const { graphClient } = useGraphClient()

    const users = ref([])
    const groups = ref([])
    const roles = ref([])
    const selectedUsers = ref([])
    const loadedUser = ref(null)
    const sideBarLoading = ref(false)
    const listHeaderPosition = ref(0)
    const template = ref()
    let loadResourcesEventToken
    let userUpdatedEventToken

    const loadGroupsTask = useTask(function* (signal) {
      const groupsResponse = yield unref(graphClient).groups.listGroups()
      groups.value = groupsResponse.data.value
    })

    const loadAppRolesTask = useTask(function* (signal) {
      const applicationsResponse = yield unref(graphClient).applications.listApplications()
      roles.value = applicationsResponse.data.value[0].appRoles
    })

    const loadResourcesTask = useTask(function* (signal) {
      const usersResponse = yield unref(graphClient).users.listUsers('displayName')
      users.value = usersResponse.data.value || []

      yield loadGroupsTask.perform()
      yield loadAppRolesTask.perform()
    })

    /**
     * This function reloads the user with expanded attributes,
     * this is necessary as we don't load all the data while listing the users
     * for performance reasons
     */
    const loadAdditionalUserDataTask = useTask(function* (signal, user) {
      const { data } = yield unref(graphClient).users.getUser(user.id)
      return data
    })

    watch(
      selectedUsers,
      async () => {
        const loadAdditionalData = unref(selectedUsers).length === 1
        if (loadAdditionalData && unref(loadedUser)?.id === unref(selectedUsers)[0].id) {
          // current user is already loaded
          return
        }

        sideBarLoading.value = true
        if (loadAdditionalData) {
          loadedUser.value = await loadAdditionalUserDataTask.perform(unref(selectedUsers)[0])
          sideBarLoading.value = false
          return
        }

        loadedUser.value = null
        sideBarLoading.value = false
      },
      { deep: true }
    )

    const calculateListHeaderPosition = () => {
      listHeaderPosition.value = unref(template)?.$refs?.appBar?.getBoundingClientRect()?.height
    }
    onMounted(async () => {
      await loadResourcesTask.perform()
      loadResourcesEventToken = eventBus.subscribe('app.admin-settings.list.load', () => {
        loadResourcesTask.perform()
      })
      userUpdatedEventToken = eventBus.subscribe(
        'app.admin-settings.users.user.updated',
        (updatedUser) => {
          selectedUsers.value = [updatedUser]
        }
      )
      calculateListHeaderPosition()
      window.addEventListener('resize', calculateListHeaderPosition)
    })

    onBeforeUnmount(() => {
      eventBus.unsubscribe('app.admin-settings.list.load', loadResourcesEventToken)
      eventBus.unsubscribe('app.admin-settings.users.user.updated', userUpdatedEventToken)
    })

    return {
      ...useSideBar(),
      template,
      selectedUsers,
      loadedUser,
      sideBarLoading,
      users,
      roles,
      groups,
      loadResourcesTask,
      loadAdditionalUserDataTask,
      graphClient,
      accessToken,
      listHeaderPosition
    }
  },
  data: function () {
    return {
      createUserModalOpen: false,
      deleteUserModalOpen: false
    }
  },
  computed: {
    ...mapGetters(['configuration']),
    ...mapState({ currentUser: 'user' }),

    selectedUsersText() {
      const translated = this.$gettext('%{ userCount } selected')

      return this.$gettextInterpolate(translated, { userCount: this.selectedUsers.length })
    },
    breadcrumbs() {
      return [
        { text: this.$gettext('Administration Settings'), to: { path: '/admin-settings' } },
        {
          text: this.$gettext('Users'),
          onClick: () => eventBus.publish('app.admin-settings.list.load')
        }
      ]
    },

    allUsersSelected() {
      return this.users.length === this.selectedUsers.length
    },

    sideBarAvailablePanels() {
      return [
        {
          app: 'DetailsPanel',
          icon: 'user',
          title: this.$gettext('User details'),
          component: DetailsPanel,
          default: true,
          enabled: true,
          componentAttrs: { user: this.loadedUser, users: this.selectedUsers, roles: this.roles }
        },
        {
          app: 'EditPanel',
          icon: 'pencil',
          title: this.$gettext('Edit user'),
          component: EditPanel,
          default: false,
          enabled: this.selectedUsers.length === 1,
          componentAttrs: {
            user: this.loadedUser,
            roles: this.roles,
            groups: this.groups,
            onConfirm: this.editUser
          }
        }
      ].filter((p) => p.enabled)
    }
  },
  methods: {
    ...mapActions(['showMessage']),
    ...mapMutations('runtime/spaces', ['UPDATE_SPACE_FIELD']),

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
    async deleteUsers(usersToDelete) {
      if (usersToDelete.some((user) => user.id === this.currentUser.uuid)) {
        this.showMessage({
          title: this.$gettext('Self deletion is not allowed'),
          status: 'danger'
        })
      }

      usersToDelete = usersToDelete.filter((user) => user.id !== this.currentUser.uuid)

      const promises = usersToDelete.map((user) => this.graphClient.users.deleteUser(user.id))

      if (!promises.length) {
        return this.toggleDeleteUserModal()
      }

      try {
        await Promise.all(promises)
        this.showMessage({
          title: this.$gettextInterpolate(
            this.$ngettext(
              'User "%{user}" was deleted successfully',
              '%{userCount} users were deleted successfully',
              usersToDelete.length
            ),
            {
              userCount: usersToDelete.length,
              user: usersToDelete[0].onPremisesSamAccountName
            },
            true
          )
        })
        this.users = this.users.filter((user) => {
          return !usersToDelete.find((deletedUser) => user.id === deletedUser.id)
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
              usersToDelete.length
            ),
            {
              userCount: usersToDelete.length,
              user: usersToDelete.onPremisesSamAccountName
            },
            true
          ),
          status: 'danger'
        })
      }
    },
    async createUser(user) {
      try {
        const { id: createdUserId } = (await this.graphClient.users.createUser(user))?.data
        const { data: createdUser } = await this.graphClient.users.getUser(createdUserId)
        this.users.push(createdUser)

        this.toggleCreateUserModal()
        this.showMessage({
          title: this.$gettext('User was created successfully')
        })
      } catch (error) {
        console.error(error)
        this.showMessage({
          title: this.$gettext('Failed to create user'),
          status: 'danger'
        })
      }
    },
    async editUser({ user, editUser }) {
      try {
        const graphEditUserRawObjectExtractor = (user) => {
          return omit(user, ['drive', 'appRoleAssignments', 'memberOf'])
        }

        if (
          !isEqual(graphEditUserRawObjectExtractor(user), graphEditUserRawObjectExtractor(editUser))
        ) {
          await this.graphClient.users.editUser(
            editUser.id,
            graphEditUserRawObjectExtractor(editUser)
          )
        }

        if (!isEqual(user.drive?.quota?.total, editUser.drive?.quota?.total)) {
          await this.updateUserDrive(editUser)
        }

        if (!isEqual(user.memberOf, editUser.memberOf)) {
          await this.updateUserGroupAssignments(user, editUser)
        }

        if (
          !isEqual(user.appRoleAssignments[0].appRoleId, editUser.appRoleAssignments[0].appRoleId)
        ) {
          await this.updateUserAppRoleAssignments(user, editUser)
        }

        const { data: updatedUser } = await this.graphClient.users.getUser(user.id)

        const userIndex = this.users.findIndex((user) => user.id === updatedUser.id)
        this.users[userIndex] = updatedUser

        eventBus.publish('sidebar.entity.saved')
        eventBus.publish('app.admin-settings.users.user.updated', updatedUser)
      } catch (error) {
        console.error(error)
        this.showMessage({
          title: this.$gettext('Failed to edit user'),
          status: 'danger'
        })
      }
    },
    async updateUserAppRoleAssignments(user, editUser) {
      await this.graphClient.users.createUserAppRoleAssignment(user.id, {
        appRoleId: editUser.appRoleAssignments[0].appRoleId,
        resourceId: editUser.appRoleAssignments[0].resourceId,
        principalId: editUser.id
      })
    },
    async updateUserDrive(editUser) {
      const updateDriveResponse = await this.graphClient.drives.updateDrive(
        editUser.drive.id,
        { quota: { total: editUser.drive.quota.total } },
        {}
      )

      if (editUser.id === this.currentUser.uuid) {
        // Load current user quota
        this.UPDATE_SPACE_FIELD({
          id: editUser.drive.id,
          field: 'spaceQuota',
          value: updateDriveResponse.data.quota
        })
      }
    },
    async updateUserGroupAssignments(user, editUser) {
      const groupsToAdd = editUser.memberOf.filter((editUserGroup) => {
        return !user.memberOf.some((g) => g.id === editUserGroup.id)
      })

      const groupsToDelete = user.memberOf.filter((editUserGroup) => {
        return !editUser.memberOf.some((g) => g.id === editUserGroup.id)
      })

      for (const groupToAdd of groupsToAdd) {
        await this.graphClient.groups.addMember(groupToAdd.id, user.id, this.configuration.server)
      }

      for (const groupToDelete of groupsToDelete) {
        await this.graphClient.groups.deleteMember(groupToDelete.id, user.id)
      }
    }
  }
})
</script>
