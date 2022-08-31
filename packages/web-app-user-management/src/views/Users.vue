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
      </template>
      <template #mainContent>
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
            :class="{ 'users-table-squashed': sideBarOpen }"
            :selected-users="selectedUsers"
            :header-position="listHeaderPosition"
            @toggleSelectUser="toggleSelectUser"
            @toggleSelectAllUsers="toggleSelectAllUsers"
            @showPanel="showPanel"
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
import GroupAssignmentsPanel from '../components/Users/SideBar/GroupAssignmentsPanel.vue'
import NoContentMessage from 'web-pkg/src/components/NoContentMessage.vue'
import { useAccessToken, useStore } from 'web-pkg/src/composables'
import { ref, unref } from '@vue/composition-api'
import { useTask } from 'vue-concurrency'
import { bus } from 'web-pkg/src/instance'
import { mapActions, mapGetters, mapMutations, mapState } from 'vuex'
import axios from 'axios'
import { $gettext } from 'files/src/router/utils'
import { defineComponent } from '@vue/runtime-core'
import { useGraphClient } from 'web-client/src/composables'
import AppTemplate from '../components/AppTemplate.vue'

export default defineComponent({
  components: {
    AppTemplate,
    UsersList,
    NoContentMessage,
    CreateUserModal,
    DeleteUserModal
  },
  setup() {
    const store = useStore()
    const users = ref([])
    const groups = ref([])
    const roles = ref([])
    const userAssignments = ref({})
    const accessToken = useAccessToken({ store })
    const { graphClient } = useGraphClient()

    /**
     * Setting api calls are just temporary and will be replaced with the graph api,
     * as the backend supports it.
     */
    const loadRolesTask = useTask(function* (signal) {
      const rolesResponse = yield axios.post(
        '/api/v0/settings/roles-list',
        {},
        {
          headers: {
            authorization: `Bearer ${unref(accessToken)}`
          }
        }
      )
      roles.value = rolesResponse.data.bundles
    })

    /**
     * Setting api calls are just temporary and will be replaced with the graph api,
     * as the backend supports it.
     */
    const loadUserRoleTask = useTask(function* (signal, ref) {
      const userAssignmentResponse = yield axios.post(
        '/api/v0/settings/assignments-list',
        {
          account_uuid: ref.user?.id
        },
        {
          headers: {
            authorization: `Bearer ${unref(accessToken)}`
          }
        }
      )
      const assignments = userAssignmentResponse.data?.assignments
      ref.user.role = {}
      const roleAssignment = assignments.find((assignment) => 'roleId' in assignment)

      if (roleAssignment) {
        const role = roles.value.find((role) => role.id === roleAssignment.roleId)
        if (role) {
          ref.user.role = role
        }
      }

      userAssignments.value[ref.user?.id] = userAssignmentResponse.data?.assignments
    })

    const loadGroupsTask = useTask(function* (signal) {
      const groupsResponse = yield unref(graphClient).groups.listGroups()
      groups.value = groupsResponse.data.value
    })

    const loadResourcesTask = useTask(function* (signal) {
      const usersResponse = yield unref(graphClient).users.listUsers('displayName')
      users.value = usersResponse.data.value || []

      users.value.forEach((user) => {
        user.memberOf = user.memberOf || []
        user.passwordProfile = user.passwordProfile || { password: '' }
      })

      yield loadGroupsTask.perform()
      yield loadRolesTask.perform()

      for (const user of users.value) {
        try {
          yield loadUserRoleTask.perform({ user })
        } catch (e) {
          console.error(`Failed to load role for user '${user.displayName}'`)
        }
      }
    })

    const loadAdditionalUserDataTask = useTask(function* (signal, ref, user) {
      const { data } = yield unref(graphClient).users.getUser(user.id)

      if (!data.drive) {
        return
      }

      user.drive = data.drive

      if (!user.drive.quota) {
        user.drive.quota = { total: 0 }
      }
    })

    return {
      users,
      roles,
      groups,
      loadResourcesTask,
      loadAdditionalUserDataTask,
      graphClient,
      accessToken
    }
  },
  data: function () {
    return {
      listHeaderPosition: 0,
      selectedUsers: [],
      createUserModalOpen: false,
      deleteUserModalOpen: false,
      sideBarOpen: false,
      sideBarActivePanel: 'DetailsPanel'
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

    sideBarAvailablePanels() {
      return [
        {
          app: 'DetailsPanel',
          icon: 'user',
          title: $gettext('User details'),
          component: DetailsPanel,
          default: true,
          enabled: true,
          componentAttrs: { users: this.selectedUsers }
        },
        {
          app: 'EditPanel',
          icon: 'pencil',
          title: $gettext('Edit user'),
          component: EditPanel,
          default: false,
          enabled: this.selectedUsers.length === 1,
          componentAttrs: { user: this.selectedUsers[0], roles: this.roles },
          componentListeners: { confirm: this.editUser }
        },
        {
          app: 'GroupAssignmentsPanel',
          icon: 'group-2',
          title: $gettext('Group assignments'),
          component: GroupAssignmentsPanel,
          default: false,
          enabled: this.selectedUsers.length === 1,
          componentAttrs: { user: this.selectedUsers[0], groups: this.groups },
          componentListeners: { confirm: this.editUserGroupAssignments }
        }
      ]
    }
  },

  watch: {
    selectedUsers() {
      if (!this.selectedUsers.length || this.selectedUsers.length > 1) {
        this.sideBarActivePanel = 'DetailsPanel'
      }
    }
  },

  async mounted() {
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
    ...mapMutations('runtime/spaces', ['UPDATE_SPACE_FIELD']),

    calculateListHeaderPosition() {
      this.listHeaderPosition = this.$refs?.template?.$refs?.appBar?.getBoundingClientRect()?.height
    },
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
      this.sideBarActivePanel = panel || 'DetailsPanel'
    },
    toggleSideBar() {
      this.sideBarOpen = !this.sideBarOpen
    },
    closeSideBar() {
      this.sideBarOpen = false
    },
    async showPanel({ user, panel }) {
      await this.loadAdditionalUserDataTask.perform(this, user)
      this.selectedUsers = [user]
      this.sideBarActivePanel = panel
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
        this.users.push({
          ...response?.data,
          ...{ memberOf: [], role: this.roles.find((role) => role.name === 'user') }
        })
      } catch (error) {
        console.error(error)
        this.showMessage({
          title: this.$gettext('Failed to create user'),
          status: 'danger'
        })
      }
    },
    async editUser(editUser) {
      try {
        const actualUser = this.users.find((user) => user.id === editUser.id)

        const graphEditUserRawObjectExtractor = (user) => {
          return omit(user, ['drive', 'role'])
        }

        if (
          !isEqual(
            graphEditUserRawObjectExtractor(actualUser),
            graphEditUserRawObjectExtractor(editUser)
          )
        )
          await this.graphClient.users.editUser(
            editUser.id,
            graphEditUserRawObjectExtractor(editUser)
          )

        if (!isEqual(actualUser.drive, editUser.drive)) {
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
        }

        if (!isEqual(actualUser.role, editUser.role)) {
          /**
           * Setting api calls are just temporary and will be replaced with the graph api,
           * as the backend supports it.
           */
          await axios.post(
            '/api/v0/settings/assignments-add',
            {
              account_uuid: editUser.id,
              role_id: editUser.role.id
            },
            {
              headers: {
                authorization: `Bearer ${this.accessToken}`
              }
            }
          )
        }

        this.$set(
          this.users,
          this.users.findIndex((user) => user.id === editUser.id),
          editUser
        )
        /**
         * The user object gets actually exchanged, therefore we update the selected users
         */
        this.selectedUsers = [editUser]

        bus.publish('sidebar.entity.saved')
      } catch (error) {
        console.error(error)
        this.showMessage({
          title: this.$gettext('Failed to edit user'),
          status: 'danger'
        })
      }
    },
    async editUserGroupAssignments(editUser) {
      try {
        const user = this.users.find((user) => user.id === editUser.id)

        const groupsToAdd = editUser.memberOf.filter((editUserGroup) => {
          return !user.memberOf.includes(editUserGroup)
        })
        const groupsToDelete = user.memberOf.filter((editUserGroup) => {
          return !editUser.memberOf.includes(editUserGroup)
        })

        for (const groupToAdd of groupsToAdd) {
          await this.graphClient.groups.addMember(groupToAdd.id, user.id, this.configuration.server)
        }

        for (const groupToDelete of groupsToDelete) {
          await this.graphClient.groups.deleteMember(groupToDelete.id, user.id)
        }

        this.$set(
          this.users,
          this.users.findIndex((user) => user.id === editUser.id),
          editUser
        )
        /**
         * The user object gets actually exchanged, therefore we update the selected users
         */
        this.selectedUsers = [editUser]

        bus.publish('sidebar.entity.saved')
      } catch (error) {
        console.error(error)
        this.showMessage({
          title: this.$gettext('Failed to edit group assignments'),
          status: 'danger'
        })
      }
    }
  }
})
</script>
