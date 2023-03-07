<template>
  <div>
    <app-template
      ref="template"
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
            <batch-actions class="oc-ml-s" :items="selectedUsers" :actions="batchActions" />
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
        <app-loading-spinner v-if="loadResourcesTask.isRunning || !loadResourcesTask.last" />
        <div v-else>
          <UsersList
            :users="users"
            :roles="roles"
            :class="{ 'users-table-squashed': sideBarOpen }"
            :selected-users="selectedUsers"
            :header-position="listHeaderPosition"
            @toggle-select-user="toggleSelectUser"
            @toggle-select-all-users="toggleSelectAllUsers"
            @un-select-all-users="unselectAllUsers"
          >
            <template #contextMenu>
              <context-actions :items="selectedUsers" />
            </template>
            <template #filter>
              <div class="oc-flex oc-flex-middle oc-ml-m oc-mb-m oc-mt-m">
                <div class="oc-mr-m oc-flex oc-flex-middle">
                  <oc-icon name="filter-2" class="oc-mr-xs" />
                  <span v-text="$gettext('Filter:')" />
                </div>
                <item-filter
                  filter-name="groups"
                  :filter-label="$gettext('Groups')"
                  :items="groups"
                  :show-filter="true"
                  :allow-multiple="true"
                  display-name-attribute="displayName"
                  :filterable-attributes="['displayName']"
                  class="oc-mr-s"
                  @selection-change="filterGroups"
                >
                  <template #image="{ item }">
                    <avatar-image :width="32" :userid="item.id" :user-name="item.displayName" />
                  </template>
                  <template #item="{ item }">
                    <div v-text="item.displayName" />
                  </template>
                </item-filter>
                <item-filter
                  filter-name="roles"
                  :filter-label="$gettext('Roles')"
                  :items="roles"
                  :show-filter="true"
                  :allow-multiple="true"
                  display-name-attribute="displayName"
                  :filterable-attributes="['displayName']"
                  @selection-change="filterRoles"
                >
                  <template #image="{ item }">
                    <avatar-image
                      :width="32"
                      :userid="item.id"
                      :user-name="$gettext(item.displayName)"
                    />
                  </template>
                  <template #item="{ item }">
                    <div v-text="$gettext(item.displayName)" />
                  </template>
                </item-filter>
              </div>
            </template>
          </UsersList>
        </div>
      </template>
    </app-template>
    <create-user-modal
      v-if="createUserModalOpen"
      @cancel="toggleCreateUserModal"
      @confirm="createUser"
    />
    <quota-modal
      v-if="quotaModalIsOpen"
      :cancel="closeQuotaModal"
      :spaces="selectedPersonalDrives"
      :max-quota="maxQuota"
      @space-quota-updated="spaceQuotaUpdated"
    />
  </div>
</template>

<script lang="ts">
import isEqual from 'lodash-es/isEqual'
import isEmpty from 'lodash-es/isEmpty'
import omit from 'lodash-es/omit'
import UsersList from '../components/Users/UsersList.vue'
import CreateUserModal from '../components/Users/CreateUserModal.vue'
import ContextActions from '../components/Users/ContextActions.vue'
import DetailsPanel from '../components/Users/SideBar/DetailsPanel.vue'
import EditPanel from '../components/Users/SideBar/EditPanel.vue'
import BatchActions from 'web-pkg/src/components/BatchActions.vue'
import QuotaModal from 'web-pkg/src/components/Spaces/QuotaModal.vue'
import Delete from '../mixins/users/delete'
import {
  queryItemAsString,
  useAccessToken,
  useCapabilitySpacesMaxQuota,
  useGraphClient,
  useRouteQuery,
  useStore
} from 'web-pkg/src/composables'
import {
  computed,
  defineComponent,
  getCurrentInstance,
  ref,
  onBeforeUnmount,
  onMounted,
  unref,
  watch
} from 'vue'
import { useTask } from 'vue-concurrency'
import { eventBus } from 'web-pkg/src/services/eventBus'
import { mapActions, mapGetters, mapMutations, mapState } from 'vuex'
import AppTemplate from '../components/AppTemplate.vue'
import { useSideBar } from 'web-pkg/src/composables/sideBar'
import ItemFilter from 'web-pkg/src/components/ItemFilter.vue'
import AppLoadingSpinner from 'web-pkg/src/components/AppLoadingSpinner.vue'
import EditQuota from 'web-pkg/src/mixins/spaces/editQuota'
import { toRaw } from 'vue'
import { SpaceResource } from 'web-client/src'
import { useGettext } from 'vue3-gettext'
import { diff } from 'deep-object-diff'
import { format } from 'util'

export default defineComponent({
  name: 'UsersView',
  components: {
    AppLoadingSpinner,
    AppTemplate,
    UsersList,
    CreateUserModal,
    BatchActions,
    ContextActions,
    ItemFilter,
    QuotaModal
  },
  mixins: [Delete, EditQuota],
  setup() {
    const instance = getCurrentInstance().proxy as any
    const { $gettext } = useGettext()
    const store = useStore()
    const accessToken = useAccessToken({ store })
    const { graphClient } = useGraphClient()

    const users = ref([])
    const groups = ref([])
    const roles = ref([])
    const selectedUsers = ref([])
    const additionalUserDataLoadedForUserIds = ref([])
    const selectedUserIds = computed(() =>
      unref(selectedUsers).map((selectedUser) => selectedUser.id)
    )
    const loadedUser = ref(null)
    const sideBarLoading = ref(false)
    const createUserModalOpen = ref(false)
    const listHeaderPosition = ref(0)
    const template = ref()
    let loadResourcesEventToken
    let userUpdatedEventToken

    const filters = {
      groups: {
        param: useRouteQuery('q_groups'),
        query: `memberOf/any(m:m/id eq '%s')`,
        ids: ref([])
      },
      roles: {
        param: useRouteQuery('q_roles'),
        query: `appRoleAssignments/any(m:m/appRoleId eq '%s')`,
        ids: ref([])
      }
    }

    const loadGroupsTask = useTask(function* (signal) {
      const groupsResponse = yield unref(graphClient).groups.listGroups()
      groups.value = groupsResponse.data.value
    })

    const loadAppRolesTask = useTask(function* (signal) {
      const applicationsResponse = yield unref(graphClient).applications.listApplications()
      roles.value = applicationsResponse.data.value[0].appRoles
    })

    const loadUsersTask = useTask(function* (signal) {
      const filter = Object.values(filters)
        .reduce((acc, f) => {
          const str = unref(f.ids)
            .map((id) => format(f.query, id))
            .join(' or ')
          if (str) {
            acc.push(`(${str})`)
          }
          return acc
        }, [])
        .filter(Boolean)
        .join(' and ')

      const usersResponse = yield unref(graphClient).users.listUsers('displayName', filter)
      users.value = usersResponse.data.value || []
    })

    const loadResourcesTask = useTask(function* (signal) {
      yield loadUsersTask.perform()
      yield loadGroupsTask.perform()
      yield loadAppRolesTask.perform()
    })

    /**
     * This function reloads the user with expanded attributes,
     * this is necessary as we don't load all the data while listing the users
     * for performance reasons
     */
    const loadAdditionalUserDataTask = useTask(function* (signal, user, forceReload = false) {
      /**
       * Prevent load additional user data multiple times if not needed
       */
      if (!forceReload && unref(additionalUserDataLoadedForUserIds).includes(user.id)) {
        return
      }

      const { data } = yield unref(graphClient).users.getUser(user.id)
      unref(additionalUserDataLoadedForUserIds).push(user.id)

      Object.assign(user, data)
    })

    const filterGroups = (groups) => {
      filters.groups.ids.value = groups.map((g) => g.id)
      loadUsersTask.perform()
      selectedUsers.value = []
      additionalUserDataLoadedForUserIds.value = []
    }
    const filterRoles = (roles) => {
      filters.roles.ids.value = roles.map((r) => r.id)
      loadUsersTask.perform()
      selectedUsers.value = []
      additionalUserDataLoadedForUserIds.value = []
    }

    const selectedPersonalDrives = ref([])
    watch(selectedUserIds, async () => {
      sideBarLoading.value = true
      // Load additional user data
      const requests = unref(selectedUsers).map((user) => loadAdditionalUserDataTask.perform(user))
      const results = await Promise.allSettled<Array<unknown>>(requests)
      const failedRequests = results.filter((result) => result.status === 'rejected')
      if (failedRequests.length > 0) {
        console.debug('Failed to load additional user data', failedRequests)
      }

      selectedPersonalDrives.value.splice(0, unref(selectedPersonalDrives).length)
      unref(selectedUsers).forEach((user) => {
        const drive = toRaw(user.drive)
        if (drive === undefined || drive.id === undefined) {
          return
        }
        const spaceResource = {
          id: drive.id,
          name: $gettext(' of %{name}', { name: user.displayName }),
          spaceQuota: drive.quota
        } as SpaceResource
        selectedPersonalDrives.value.push(spaceResource)
      })

      loadedUser.value = unref(selectedUsers).length === 1 ? unref(selectedUsers)[0] : null
      sideBarLoading.value = false
    })

    const calculateListHeaderPosition = () => {
      listHeaderPosition.value = unref(template)?.$refs?.appBar?.getBoundingClientRect()?.height
    }

    const batchActions = computed(() => {
      return [...instance.$_delete_items, ...instance.$_editQuota_items].filter((item) =>
        item.isEnabled({ resources: unref(selectedUsers) })
      )
    })

    onMounted(async () => {
      for (const f in filters) {
        filters[f].ids.value = queryItemAsString(unref(filters[f].param))?.split('+') || []
      }

      await loadResourcesTask.perform()
      loadResourcesEventToken = eventBus.subscribe('app.admin-settings.list.load', () => {
        loadResourcesTask.perform()
        selectedUsers.value = []
      })
      userUpdatedEventToken = eventBus.subscribe(
        'app.admin-settings.users.user.updated',
        (updatedUser) => {
          selectedUsers.value = [updatedUser]
          loadedUser.value = updatedUser
        }
      )
      calculateListHeaderPosition()
      window.addEventListener('resize', calculateListHeaderPosition)
    })

    onBeforeUnmount(() => {
      eventBus.unsubscribe('app.admin-settings.list.load', loadResourcesEventToken)
      eventBus.unsubscribe('app.admin-settings.users.user.updated', userUpdatedEventToken)
    })

    const quotaModalIsOpen = computed(() => instance.$data.$_editQuota_modalOpen)
    const closeQuotaModal = () => {
      instance.$_editQuota_closeModal()
    }
    const spaceQuotaUpdated = (quota) => {
      instance.$data.$_editQuota_selectedSpace.spaceQuota = quota
    }

    return {
      ...useSideBar(),
      maxQuota: useCapabilitySpacesMaxQuota(),
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
      listHeaderPosition,
      createUserModalOpen,
      batchActions,
      filterGroups,
      filterRoles,
      quotaModalIsOpen,
      closeQuotaModal,
      spaceQuotaUpdated,
      selectedPersonalDrives
    }
  },
  computed: {
    ...mapGetters(['configuration']),
    ...mapState({ currentUser: 'user' }),

    selectedUsersText() {
      return this.$gettext('%{ userCount } selected', { userCount: this.selectedUsers.length })
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
        const graphEditUserPayloadExtractor = (user) => {
          return omit(user, ['drive', 'appRoleAssignments', 'memberOf'])
        }
        const graphEditUserPayload = diff(
          graphEditUserPayloadExtractor(user),
          graphEditUserPayloadExtractor(editUser)
        )

        if (!isEmpty(graphEditUserPayload)) {
          await this.graphClient.users.editUser(editUser.id, graphEditUserPayload)
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

        return updatedUser
      } catch (error) {
        console.error(error)
        this.showMessage({
          title: this.$gettext('Failed to edit user'),
          status: 'danger'
        })
      }
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
    updateUserAppRoleAssignments(user, editUser) {
      return this.graphClient.users.createUserAppRoleAssignment(user.id, {
        appRoleId: editUser.appRoleAssignments[0].appRoleId,
        resourceId: editUser.appRoleAssignments[0].resourceId,
        principalId: editUser.id
      })
    },
    updateUserGroupAssignments(user, editUser) {
      const groupsToAdd = editUser.memberOf.filter(
        (editUserGroup) => !user.memberOf.some((g) => g.id === editUserGroup.id)
      )
      const groupsToDelete = user.memberOf.filter(
        (editUserGroup) => !editUser.memberOf.some((g) => g.id === editUserGroup.id)
      )
      const requests = []

      for (const groupToAdd of groupsToAdd) {
        requests.push(
          this.graphClient.groups.addMember(groupToAdd.id, user.id, this.configuration.server)
        )
      }
      for (const groupToDelete of groupsToDelete) {
        requests.push(this.graphClient.groups.deleteMember(groupToDelete.id, user.id))
      }

      return Promise.all(requests)
    }
  }
})
</script>
